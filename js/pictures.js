/* global Photo: true, Gallery: true */
'use strict';

(function() {
  /**
   * Форма с классом filters.
   * @type {HTMLFormElement}
   */
  var filterFormElement = document.querySelector('form.filters');
  /**
   * Div с классом pictures.
   * @type {Element}
   */
  var pictureContainer = document.querySelector('div.pictures');
  /**
   * Массив загруженных из json фотографий
   * @type {Array}
     */
  var loadedPictures = [];
  /**
   * Массив отфильтрованных фотографий
   * @type {Array}
     */
  var filteredPictures = [];
  /**
   * Массив фотографий, отрисованных на странице
   * @type {Array}
     */
  var renderedElements = [];
  /**
   * Инициализация номера страницы для показа фотографий
   * @type {number}
     */
  var currentPage = 0;
  /**
   * Число фотографий на странице
   * @type {number}
     */
  var PAGE_SIZE = 12;
  /**
   * Высота отрисованной фотографии
   * @type {number}
     */
  var NEW_IMAGE_HEIGHT = 182;
  /**
   * Создание экземпляра объекта Галерея из конструктора
   */
  var gallery = new Gallery();

  /**
   * Показывает сообщение об ошибке
   * @param {Element} element
   */
  function showError(element) {
    element.classList.add('pictures-failure');
  }

  /**
   * Показывает сообщение о загрузке
   * @param {Element} element
   */
  function showPreloader(element) {
    element.classList.add('pictures-loading');
  }

  /**
   * Прячет сообщение о загрузке
   * @param {Element} element
   */
  function hidePreloader(element) {
    element.classList.remove('pictures-loading');
  }

  /**
   * Прячет элемент со страницы
   * @param {Element} element
   */
  function hideElement(element) {
    element.classList.add('hidden');
  }

  /**
   * Показывает элемент на странице
   * @param {Element} element
   */
  function showElement(element) {
    element.classList.remove('hidden');
  }

  //Выбор фильтров для показа списка фотографий
  var filters = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementID = evt.target.id;
      setActiveFilter(clickedElementID);
    };
  }

  /**
   * Отрисовка фотографий постранично при скролле
   */
  var scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      if (window.pageYOffset >= document.body.clientHeight - window.innerHeight) {
        if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
          renderPictures(filteredPictures, ++currentPage, false);
        }
      }
    }, 100);
  });

  getPictures();

  /**
   * Отрисовывает на странице список фотографий из заданного массива
   * @param {Array} pictures
   * @param {number} pageNumber
   * @param {boolean} rewriteFlag
     */
  function renderPictures(pictures, pageNumber, rewriteFlag) {
    if (rewriteFlag) {
      //Очищаем блок с фотографиями
      var el;
      while ((el = renderedElements.shift())) {
        pictureContainer.removeChild(el.element);
        el.onClickCallback = null;
        el.remove();
      }
    }
    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);
    renderedElements = renderedElements.concat(pagePictures.map(function(picture, index) {
      var photoElement = new Photo(picture);
      photoElement.render();
      fragment.appendChild(photoElement.element);
      photoElement.onClickCallback = function() {
        gallery.setCurrentPicture(from + index);
        gallery.show();
      };
      return photoElement;
    }));
    pictureContainer.appendChild(fragment);
    if (pageHasMorePlace() && (to <= pictures.length)) {
      renderPictures(pictures, ++currentPage, false);
    }
  }

  /**
   * Проверяет, есть ли место на странице для отображения
   * следующего списка фотографий
   * @returns {boolean}
     */
  function pageHasMorePlace() {
    var lastPicture = pictureContainer.querySelector('a.picture:last-of-type');
    var lastPictureY = lastPicture.getBoundingClientRect().bottom;
    if ((window.innerHeight - lastPictureY) > Math.ceil(NEW_IMAGE_HEIGHT / 3)) {
      return true;
    }
    return false;
  }

  /**
   * Загружает список фотографий из json
   */
  function getPictures() {
    var DATA_LOAD_TIMEOUT = 10000;
    hideElement(filterFormElement);
    var xhr = new XMLHttpRequest();
    xhr.timeout = DATA_LOAD_TIMEOUT;
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.onload = function(evt) {
      var rawData = evt.target.response;
      loadedPictures = JSON.parse(rawData);
      filteredPictures = loadedPictures.slice(0);
      gallery.setPictures(filteredPictures);
      renderPictures(filteredPictures, 0, false);
      hidePreloader(pictureContainer);
      showElement(filterFormElement);
    };
    xhr.onerror = function() {
      showError(pictureContainer);
    };
    showPreloader(pictureContainer);
    xhr.send();
    //Если сервер не отвечает по таймауту
    xhr.ontimeout = function() {
      loadedPictures = '';
      showError(pictureContainer); // Показываем ошибку
    };
  }

  /**
   * Устанавливает текущий активный фильтр
   * @param {string} id
     */
  function setActiveFilter(id) {
    var radioInputs = filterFormElement.querySelectorAll('input[type="radio"]');
    if (radioInputs) {
      for (i = 0; i < radioInputs.length; i++) {
        if (radioInputs[i].getAttribute('checked')) {
          radioInputs[i].removeAttribute('checked');
          break;
        }
      }
      filterFormElement.querySelector('#' + id).checked = true;
      filteredPictures = loadedPictures.slice(0);

      switch (id) {
        case 'filter-popular':
          break;
        case 'filter-new':
          var dateTimeNow = new Date();
          var TWO_WEEKS_MILLISECONDS = 2 * 7 * 24 * 60 * 60 * 1000;
          var delta, d;
          var date1, date2;
          filteredPictures = filteredPictures.filter(function(pic) {
            d = new Date(pic.date);
            delta = +dateTimeNow - +d;
            return delta <= TWO_WEEKS_MILLISECONDS;
          }).sort(function(pic1, pic2) {
            date1 = new Date(pic1.date);
            date2 = new Date(pic2.date);
            return +date2 - +date1;
          });
          break;
        case 'filter-discussed':
          filteredPictures = filteredPictures.sort(function(a, b) {
            return b.comments - a.comments;
          });
          break;
      }

      currentPage = 0;
      renderPictures(filteredPictures, currentPage, true);
      gallery.setPictures(filteredPictures);
    }
  }
})();
