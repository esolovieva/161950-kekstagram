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
   * @type {HTMLFormElement}
   */
  var pictureContainer = document.querySelector('div.pictures');
  var loadedPictures = [];
  var filteredPictures = [];
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var NEW_IMAGE_HEIGHT = 182;
  var gallery = new Gallery();

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
      //Очищаем блок с фотографиями
      var renderedElements = pictureContainer.querySelectorAll('.picture');
      [].forEach.call(renderedElements, function(el) {
        pictureContainer.removeChild(el);
      });
    }
    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);
    var photoIndex = from;
    pagePictures.forEach(function(picture) {
      var photoElement = new Photo(picture);
      photoElement.render();
      fragment.appendChild(photoElement.element);
      photoElement.onClickCallback = function() {
        gallery.setCurrentPicture(photoIndex);
        gallery.show();
      };
      photoIndex++;
      //photoElement.element.addEventListener('click', _onClick);
    });
    pictureContainer.appendChild(fragment);
    if (pageHasMorePlace() && (to <= pictures.length)) {
      renderPictures(pictures, ++currentPage, false);
    }
  }

  ///**
  // * @param evt
  // * @private
  // */
  //function _onClick(evt) {
  //  evt.preventDefault();
  //  gallery.show();
  //}
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
      gallery.setPictures(filteredPictures);
      renderPictures(filteredPictures, currentPage, true);
    }
  }
})();
