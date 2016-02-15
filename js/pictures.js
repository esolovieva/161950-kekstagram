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
  var filteredPictures = [];
  //var renderedElements = [];
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var NEW_IMAGE_WIDTH = 182;
  var NEW_IMAGE_HEIGHT = 182;


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

  var filters = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementID = evt.target.id;
      setActiveFilter(clickedElementID);
    };
  }
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

  function renderPictures(pictures, pageNumber, rewriteFlag) {
    if (rewriteFlag) {
      pictureContainer.innerHTML = ''; //Очищаем блок с фотографиями
    }
    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);
    pagePictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    pictureContainer.appendChild(fragment);
    if (pageHasMorePlace() && (from <= pictures.length)) {
      renderPictures(pictures, ++currentPage, false);
    }
  }

  function pageHasMorePlace() {
    var lastPicture = pictureContainer.querySelector('a.picture:last-of-type');
    var lastPictureY = lastPicture.getBoundingClientRect().bottom;
    if ((window.innerHeight - lastPictureY) > Math.ceil(NEW_IMAGE_HEIGHT / 3)) {
      return true;
    }
    return false;
  }
  function getPictures() {
    var DATA_LOAD_TIMEOUT = 10000;
    hideElement(filterFormElement);
    var xhr = new XMLHttpRequest();
    xhr.timeout = DATA_LOAD_TIMEOUT;
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.onload = function(evt) {
      var rawData = evt.target.response;
      loadedPictures = JSON.parse(rawData);
      //currentPage = 0;
      filteredPictures = loadedPictures.slice(0);
      renderPictures(filteredPictures, 0, true);
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
      newImg.setAttribute('width', NEW_IMAGE_WIDTH);
      newImg.setAttribute('height', NEW_IMAGE_HEIGHT);
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
    }
  }
})();
