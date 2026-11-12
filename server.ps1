param(
    [int]$Port = 8000
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

# Compile native, high-performance, multithreaded C# HTTP Server
$source = @"
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Text;

public class SimpleDevServer
{
    private HttpListener _listener;
    private string _rootDir;
    private bool _running;

    public int Port { get; private set; }

    public bool Start(string rootDir, int preferredPort)
    {
        _rootDir = rootDir;
        int[] portsToTry = new int[] { preferredPort, 8080, 8081, 3000, 5000, 8888 };

        foreach (int port in portsToTry)
        {
            try
            {
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://localhost:" + port + "/");
                _listener.Start();
                Port = port;
                _running = true;
                break;
            }
            catch
            {
                if (_listener != null)
                {
                    try { _listener.Close(); } catch { }
                    _listener = null;
                }
            }
        }

        if (!_running) return false;

        // Start listener thread
        Thread listenerThread = new Thread(ListenLoop) { IsBackground = true };
        listenerThread.Start();
        return true;
    }

    private void ListenLoop()
    {
        while (_running && _listener != null && _listener.IsListening)
        {
            try
            {
                HttpListenerContext context = _listener.GetContext();
                ThreadPool.QueueUserWorkItem(ProcessRequest, context);
            }
            catch
            {
                // listener stopped
            }
        }
    }

    private void ProcessRequest(object state)
    {
        HttpListenerContext context = (HttpListenerContext)state;
        try
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            string rawPath = request.Url.LocalPath.TrimStart('/');
            if (string.IsNullOrEmpty(rawPath)) rawPath = "index.html";

            string decodedPath = Uri.UnescapeDataString(rawPath).Replace('/', Path.DirectorySeparatorChar);
            string filePath = Path.Combine(_rootDir, decodedPath);

            if (File.Exists(filePath))
            {
                string ext = Path.GetExtension(filePath).ToLowerInvariant();
                string contentType = "application/octet-stream";
                switch (ext)
                {
                    case ".html": contentType = "text/html; charset=utf-8"; break;
                    case ".css": contentType = "text/css; charset=utf-8"; break;
                    case ".js": contentType = "application/javascript; charset=utf-8"; break;
                    case ".json": contentType = "application/json; charset=utf-8"; break;
                    case ".png": contentType = "image/png"; break;
                    case ".jpg":
                    case ".jpeg": contentType = "image/jpeg"; break;
                    case ".svg": contentType = "image/svg+xml"; break;
                    case ".mp4": contentType = "video/mp4"; break;
                    case ".glb": contentType = "model/gltf-binary"; break;
                    case ".gltf": contentType = "model/gltf+json"; break;
                    case ".dae": contentType = "model/vnd.collada+xml"; break;
                }

                response.ContentType = contentType;
                response.AddHeader("Access-Control-Allow-Origin", "*");
                response.AddHeader("Accept-Ranges", "bytes");

                FileInfo fi = new FileInfo(filePath);
                long totalBytes = fi.Length;

                string rangeHeader = request.Headers["Range"];
                if (!string.IsNullOrEmpty(rangeHeader) && rangeHeader.StartsWith("bytes="))
                {
                    string[] rangeParts = rangeHeader.Substring(6).Split('-');
                    long start = long.Parse(rangeParts[0]);
                    long end = (rangeParts.Length > 1 && !string.IsNullOrEmpty(rangeParts[1])) ? long.Parse(rangeParts[1]) : (totalBytes - 1);
                    if (end >= totalBytes) end = totalBytes - 1;
                    long length = end - start + 1;

                    response.StatusCode = 206;
                    response.AddHeader("Content-Range", "bytes " + start + "-" + end + "/" + totalBytes);
                    response.ContentLength64 = length;

                    using (FileStream fs = File.OpenRead(filePath))
                    {
                        fs.Seek(start, SeekOrigin.Begin);
                        byte[] buffer = new byte[65536];
                        long remaining = length;
                        while (remaining > 0)
                        {
                            int readSize = (int)Math.Min((long)buffer.Length, remaining);
                            int bytesRead = fs.Read(buffer, 0, readSize);
                            if (bytesRead <= 0) break;
                            response.OutputStream.Write(buffer, 0, bytesRead);
                            remaining -= bytesRead;
                        }
                    }
                }
                else
                {
                    response.StatusCode = 200;
                    response.ContentLength64 = totalBytes;

                    using (FileStream fs = File.OpenRead(filePath))
                    {
                        byte[] buffer = new byte[65536];
                        int bytesRead;
                        while ((bytesRead = fs.Read(buffer, 0, buffer.Length)) > 0)
                        {
                            response.OutputStream.Write(buffer, 0, bytesRead);
                        }
                    }
                }
            }
            else
            {
                response.StatusCode = 404;
                byte[] notFound = Encoding.UTF8.GetBytes("404 Not Found: " + rawPath);
                response.ContentLength64 = notFound.Length;
                response.OutputStream.Write(notFound, 0, notFound.Length);
            }

            response.OutputStream.Close();
        }
        catch
        {
            try { context.Response.OutputStream.Close(); } catch { }
        }
    }

    public void Stop()
    {
        _running = false;
        if (_listener != null)
        {
            try { _listener.Stop(); } catch { }
            try { _listener.Close(); } catch { }
            _listener = null;
        }
    }
}
"@

Add-Type -TypeDefinition $source -Language CSharp -ErrorAction SilentlyContinue

$server = New-Object SimpleDevServer
$ok = $server.Start($rootDir, $Port)

if (-not $ok) {
    Write-Host "Ошибка: не удалось запустить сервер на портах 8000, 8080, 8081." -ForegroundColor Red
    Exit
}

$actualPort = $server.Port
$url = "http://localhost:$actualPort/index.html"

Write-Host "===================================================" -ForegroundColor Green
Write-Host "  🌱 СЕРВЕР ЗАПУЩЕН: http://localhost:$actualPort/" -ForegroundColor Green
Write-Host "  Папка проекта: $rootDir" -ForegroundColor DarkGray
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Открываю браузер..." -ForegroundColor Cyan

Start-Process $url

# Keep script alive while server runs
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $server.Stop()
}
