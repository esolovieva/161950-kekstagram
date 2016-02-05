'use strict';
/* global pictures: true */
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

  /**
   * Прячет блок с фильтрами .filters, добавляя ему класс hidden.
   * @type {HTMLFormElement}
   */
  hideElement(filterFormElement);

  function hideElement(element) {
    element.classList.add('hidden');
  }

  function showElement(element) {
    element.classList.remove('hidden');
  }

  pictures.forEach(function(picture) {
    var element = getElementFromTemplate(picture);
    pictureContainer.appendChild(element);
  });

  /**
   * Отображает блок с фильтрами .filters, добавляя ему класс hidden.
   * @type {HTMLFormElement}
   */
  showElement(filterFormElement);

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
    //Проверка, что изображение загрузилось с сервера
    picImage.onload = function() {
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
    return element;
  }
})();
