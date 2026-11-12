/* ===================================================
   GALLERIES & LIGHTBOX LOGIC (FRAME 2)
   =================================================== */

// Image datasets
const rendersData = [
  {
    src: 'рендер модели/identical_reconstruction_first_i…_2k_202607182048.jpeg',
    title: 'Фронтальный 2K Рендер',
    desc: 'Идеальная визуализация конструкции умной теплицы с прозрачным куполом'
  },
  {
    src: 'рендер модели/new_camera_angle_new_perspective_202607182051.jpeg',
    title: 'Перспективный ракурс',
    desc: 'Вид на внутренние модули гидропоники и датчики влажности'
  },
  {
    src: 'рендер модели/overhead_aerial_view_scene_202607181948.jpeg',
    title: 'Вид сверху (Top View)',
    desc: 'Планировка посадочных лотков и трассировка системы автополива'
  },
  {
    src: 'рендер модели/overhead_aerial_view_scene_202607181959.jpeg',
    title: 'Аэросъемка окружения',
    desc: 'Органичное встраивание в экстерьер'
  },
  {
    src: 'рендер модели/side_profile_view_subject_202607182001.jpeg',
    title: 'Боковой профиль',
    desc: 'Эргономика каркаса и вентиляционные шлюзы'
  },
  {
    src: 'рендер модели/ultra_close-up_specific_detail_2k_202607182049.jpeg',
    title: 'Макро-детализация узлов 2K',
    desc: 'Текстуры дерева, металла и соединительных элементов'
  },
  {
    src: 'рендер модели/upscale_base_2k_202607182050.jpeg',
    title: 'Высокодетализированная база',
    desc: 'Основание конструкции и электронный блок управления'
  },
  {
    src: 'рендер модели/identical_reconstruction_first_i…_202607181959.jpeg',
    title: 'Общая экспозиция',
    desc: 'Финальный концепт-арт теплицы в рабочей среде'
  }
];

const rawData = [
  {
    src: 'сырая модель/мой первый проект.jpg',
    title: 'SketchUp 3D Модель (Вид 1)',
    desc: 'Первичная 3D геометрия каркаса в САПР'
  },
  {
    src: 'сырая модель/мой первый проект 4.jpg',
    title: 'Каркас и внутренние секции',
    desc: 'Разделение на зоны выращивания и технический отсек'
  },
  {
    src: 'сырая модель/мой первый проект 6.jpg',
    title: '3D сборка с навесными элементами',
    desc: 'Финальное моделирование перед рендерингом'
  },
  {
    src: 'сырая модель/макет.1.jpg',
    title: 'Физический макет: чертежи',
    desc: 'Проектирование несущих перекрытий'
  },
  {
    src: 'сырая модель/макет.2.jpg',
    title: 'Сборочная схема макета',
    desc: 'Точная подгонка пазов и лазерной резки'
  },
  {
    src: 'сырая модель/1.jpg',
    title: 'Фото сборки: Этап 1',
    desc: 'Подготовка базового контура'
  },
  {
    src: 'сырая модель/2.jpg',
    title: 'Фото сборки: Этап 2',
    desc: 'Монтаж направляющих и ячеек'
  },
  {
    src: 'сырая модель/3.jpg',
    title: 'Фото сборки: Этап 3',
    desc: 'Тестирование геометрии каркаса'
  },
  {
    src: 'сырая модель/фото.1 — копия.jpg',
    title: 'Прототип: Тестирование узлов',
    desc: 'Проверка прочности конструкции'
  },
  {
    src: 'сырая модель/фото.2 — копия.jpg',
    title: 'Прототип: Установка поддона',
    desc: 'Гидроизоляция дренажной системы'
  },
  {
    src: 'сырая модель/фото.3 — копия.jpg',
    title: 'Прототип: Вентиляция',
    desc: 'Монтаж циркуляционных каналов'
  },
  {
    src: 'сырая модель/фото.4.jpg',
    title: 'Прототип: Электроника',
    desc: 'Разводка питания и сигнальных шлейфов'
  },
  {
    src: 'сырая модель/фото.5.jpg',
    title: 'Готовый прототип',
    desc: 'Финальный физический образец теплицы'
  }
];

class CarouselGallery {
  constructor(containerId, items) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.items = items;
    this.currentIndex = 0;
    this.track = this.container.querySelector('.carousel-track');
    this.dotsContainer = this.container.querySelector('.carousel-dots');
    this.thumbsContainer = this.container.querySelector('.gallery-thumbs');
    this.prevBtn = this.container.querySelector('.prev-btn');
    this.nextBtn = this.container.querySelector('.next-btn');

    this.init();
  }

  init() {
    this.renderSlides();
    this.renderDots();
    this.renderThumbs();
    this.bindEvents();
    this.updateClasses();
  }

  renderSlides() {
    this.track.innerHTML = '';
    this.items.forEach((item, idx) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.setAttribute('data-index', idx);
      slide.innerHTML = `
        <img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" />
        <div class="slide-caption">
          <div>
            <div class="slide-caption-title">${item.title}</div>
            <div style="font-size: 0.9rem; color: #94a3b8; margin-top: 4px;">${item.desc}</div>
          </div>
          <div class="slide-zoom-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </div>
        </div>
      `;

      slide.addEventListener('click', () => {
        if (idx === this.currentIndex) {
          openLightbox(this.items, this.currentIndex);
        } else {
          this.goTo(idx);
        }
      });

      this.track.appendChild(slide);
    });
  }

  renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    this.items.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => this.goTo(idx));
      this.dotsContainer.appendChild(dot);
    });
  }

  renderThumbs() {
    if (!this.thumbsContainer) return;
    this.thumbsContainer.innerHTML = '';
    this.items.forEach((item, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async" />`;
      thumb.addEventListener('click', () => this.goTo(idx));
      this.thumbsContainer.appendChild(thumb);
    });
  }

  updateClasses() {
    const slides = this.track.querySelectorAll('.carousel-slide');
    const dots = this.dotsContainer?.querySelectorAll('.carousel-dot');
    const thumbs = this.thumbsContainer?.querySelectorAll('.thumb-item');
    const total = this.items.length;

    slides.forEach((slide, idx) => {
      slide.className = 'carousel-slide';

      if (idx === this.currentIndex) {
        slide.classList.add('active');
      } else if (idx === (this.currentIndex - 1 + total) % total) {
        slide.classList.add('prev');
      } else if (idx === (this.currentIndex + 1) % total) {
        slide.classList.add('next');
      } else if (idx < this.currentIndex) {
        slide.classList.add('hidden-left');
      } else {
        slide.classList.add('hidden-right');
      }
    });

    dots?.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentIndex);
    });

    thumbs?.forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === this.currentIndex);
      // Smoothly scroll ONLY the thumbnails container, without bubbling to window or parent!
      if (idx === this.currentIndex && this.thumbsContainer) {
        const containerWidth = this.thumbsContainer.clientWidth;
        const thumbLeft = thumb.offsetLeft;
        const thumbWidth = thumb.clientWidth;
        const targetScroll = thumbLeft - (containerWidth / 2) + (thumbWidth / 2);
        this.thumbsContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    });
  }

  goTo(idx) {
    this.currentIndex = (idx + this.items.length) % this.items.length;
    this.updateClasses();
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  bindEvents() {
    this.nextBtn?.addEventListener('click', () => this.next());
    this.prevBtn?.addEventListener('click', () => this.prev());

    // Touch Swipe
    let touchStartX = 0;
    this.track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff > 50) this.prev();
      if (diff < -50) this.next();
    });
  }
}

/* Lightbox Modal */
let activeLightboxItems = [];
let currentLightboxIndex = 0;

function openLightbox(items, index) {
  activeLightboxItems = items;
  currentLightboxIndex = index;

  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');

  if (!modal || !img) return;

  img.src = items[index].src;
  if (caption) caption.textContent = `${items[index].title} — ${items[index].desc}`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function nextLightbox() {
  if (!activeLightboxItems.length) return;
  currentLightboxIndex = (currentLightboxIndex + 1) % activeLightboxItems.length;
  openLightbox(activeLightboxItems, currentLightboxIndex);
}

function prevLightbox() {
  if (!activeLightboxItems.length) return;
  currentLightboxIndex = (currentLightboxIndex - 1 + activeLightboxItems.length) % activeLightboxItems.length;
  openLightbox(activeLightboxItems, currentLightboxIndex);
}

// Lightbox Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  new CarouselGallery('renderGallery', rendersData);
  new CarouselGallery('rawGallery', rawData);

  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', prevLightbox);
  nextBtn?.addEventListener('click', nextLightbox);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });
});
