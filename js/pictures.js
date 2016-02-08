'use strict';

(function() {
  /**
   * Форма с классом filters.
   * @type {HTMLFormElement}
   */
  var filterFormElement = document.querySelector('form.filters');
  /**
   * Div с классом pictures.
   * @type {HTMLFormElement}
   */
  var pictureContainer = document.querySelector('div.pictures');
  var loadedPictures = [];
  var popularFilterElement = document.querySelector('#filter-popular');
  var newFilterElement = document.querySelector('#filter-new');
  var discussedFilterElement = document.querySelector('#filter-discussed');
  getPictures();

  function showError(element) {
    element.classList.add('pictures-failure');
  }

  function showPreloader(element) {
    element.classList.add('pictures-loading');
  }

  function hidePreloader(element) {
    element.classList.remove('pictures-loading');
  }

  function hideElement(element) {
    element.classList.add('hidden');
  }

  function showElement(element) {
    element.classList.remove('hidden');
  }
  function renderPictures(pictures) {
    var fragment = document.createDocumentFragment();
    pictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    pictureContainer.appendChild(fragment);
  }

  function getPictures() {
    var DATA_LOAD_TIMEOUT = 10000;
    hideElement(filterFormElement);
    var xhr = new XMLHttpRequest();
    xhr.timeout = DATA_LOAD_TIMEOUT;
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.onload = function(evt) {
      showPreloader(pictureContainer);
      var rawData = evt.target.response;
      loadedPictures = JSON.parse(rawData);
      renderPictures(loadedPictures);
      hidePreloader(pictureContainer);
      showElement(filterFormElement);
    };
    xhr.onerror = function() {
      showError(pictureContainer);
    };
    xhr.send();
    //Если сервер не отвечает по таймауту
    xhr.ontimeout = function() {
      loadedPictures = '';
      showError(pictureContainer); // Показываем ошибку
    };
  }

  function getElementFromTemplate(data) {
    var template = document.querySelector('#picture-template');
    var element;
    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;
    var picImage = new Image();
    var imageLoadTimeout;
    //Проверка, что изображение загрузилось с сервера
    picImage.onload = function() {
      clearTimeout(imageLoadTimeout);
      var newImg = document.createElement('img');
      newImg.src = data.url;
      newImg.setAttribute('width', '182');
      newImg.setAttribute('height', '182');
      var existingIMG = element.querySelector('img');
      var parentNode = existingIMG.parentNode;
      parentNode.replaceChild(newImg, existingIMG);
    };
    //Если изображение не загрузилось
    picImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };
    picImage.src = data.url;
    //Если сервер не отвечает по таймауту
    var IMAGE_TIMEOUT = 10000;
    imageLoadTimeout = setTimeout(function() {
      picImage.src = ''; //Прекращаем загрузку
      element.classList.add('picture-load-failure'); // Показываем ошибку
    }, IMAGE_TIMEOUT);
    return element;
  }
  /**
   * Обработчик события при выборе фильтра популярные: писок фотографий, в том виде, в котором он был загружен
   */
  popularFilterElement.onclick = function() {
    var popularPictures = loadedPictures.slice(0);
    pictureContainer.innerHTML = ''; //Очищаем блок с фотографиями
    renderPictures(popularPictures);
  };
  /**
   * Обработчик события при выборе фильтра Новые:
   * список фотографий, сделанных за последние две недели, отсортированные по убыванию даты (поле date).
   */
  newFilterElement.onclick = function() {
    var dateTimeNow = new Date();
    var TWO_WEEKS_MILLISECONDS = 2 * 7 * 24 * 60 * 60 * 1000;
    var newPictures = loadedPictures.slice(0);
    var delta, d;
    var date1, date2;
    newPictures = newPictures.filter(function(pic) {
      d = new Date(pic.date);
      delta = +dateTimeNow - +d;
      return delta <= TWO_WEEKS_MILLISECONDS;
    });
    newPictures = newPictures.sort(function(pic1, pic2) {
      date1 = new Date(pic1.date);
      date2 = new Date(pic2.date);
      return +date2 - +date1;
    });
    pictureContainer.innerHTML = ''; //Очищаем блок с фотографиями
    renderPictures(newPictures);
  };
  /**
   * Обработчик события при выборе фильтра
   * Обсуждаемые: отсортированные по убыванию количества комментариев (поле comments)
   */
  discussedFilterElement.onclick = function() {
    var discussedPictures = loadedPictures.slice(0);
    discussedPictures = discussedPictures.sort(function(a, b) {
      return b.comments - a.comments;
    });
    pictureContainer.innerHTML = ''; //Очищаем блок с фотографиями
    renderPictures(discussedPictures);
  };
})();
