/* global Resizer: true */
/* global docCookies: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */

  var selectedFilter = 'none';
 /* Хранит последний выбранный фильтр */

  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Выводит сообщения в tooltip элемента.
   */
  function showTextInTooltip(element, text) {
    if (element) {
      element.setAttribute('title', text);
    }
  }
  /**
   * Выводит сообщения об ошибках в tooltip элемента. Выделяет элемент красным цветом.
   */
  function showError(element, text) {
    element.style.border = 'solid red 2px';
    showTextInTooltip(element, text);
    showTextInTooltip(submitButton, 'Неправильно заполнены поля!\n' + text);
    submitButton.disabled = true;
    return false;
  }
  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeX = resizeForm['resize-x'];
    var resizeY = resizeForm['resize-y'];
    var resizeSize = resizeForm['resize-size'];
    var maxResizeX = currentResizer._image.naturalWidth - resizeSize.value;
    var maxResizeY = currentResizer._image.naturalHeight - resizeSize.value;

    if (+resizeX.value < 0) {
      return showError(resizeX, 'Поля «сверху» и «слева» не могут быть отрицательными.');
    }
    if (+resizeY.value < 0) {
      return showError(resizeY, 'Поля «сверху» и «слева» не могут быть отрицательными.');
    }
    if (+resizeX.value > +maxResizeX) {
      return showError(resizeSize, 'Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.');
    }
    if (+resizeY.value > +maxResizeY) {
      return showError(resizeSize, 'Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.');
    }
    return true;
  }
  /**
   * Устанавливает значения в формы кадрирования, беря значения из объкта resizer
   */
  function setFormValuesFromResizer() {
    if (typeof currentResizer !== 'undefined') {
      var resizeX = resizeForm['resize-x'];
      var resizeY = resizeForm['resize-y'];
      var resizeSize = resizeForm['resize-size'];
      if (resizeX) {
        resizeX.value = currentResizer.getConstraint().x;
      }
      if (resizeY) {
        resizeY.value = currentResizer.getConstraint().y;
      }
      if (resizeSize) {
        resizeSize.value = currentResizer.getConstraint().side;
      }
    }
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];
  var submitButton = resizeForm['resize-fwd'];
  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

   /**
   * В файле upload.js сохраните в cookies последний выбранный фильтр:
   * «Оригинал», «Хром» или «Сепия».
   * Срок жизни cookie — количество дней, прошедшее с вашего ближайшего дня рождения.
   */
  function setFilterCookie(cKey, cValue) {
    var BIRTH_MONTH_DAY = '-12-06';
    var dateTimeNow = new Date();
    var currentYear = dateTimeNow.getFullYear();
    var currentYearBirthDate = new Date(currentYear + BIRTH_MONTH_DAY);
    var previousYearBirthDate = new Date(+currentYear - 1 + BIRTH_MONTH_DAY);
    var birthDate = (+dateTimeNow - +currentYearBirthDate) > 0 ? currentYearBirthDate : previousYearBirthDate;
    var deltaDays = Math.round((dateTimeNow - birthDate) / 1000 / 60 / 60 / 24);
    var cookieExpireTime = +dateTimeNow + +deltaDays * 24 * 60 * 60 * 1000;
    var formattedCookieExpireTime = new Date(cookieExpireTime).toUTCString();
    var cookieText = cKey + '=' + cValue + ';expires=' + formattedCookieExpireTime;
    document.cookie = cookieText;
  }

  /*Выставляет нужному радиобаттону атрибут checked, с остальных снимает атрибут checked*/
  function selectFilter(filterId) {
    var filtForm = document.forms['upload-filter'];
    var radioInputs = filtForm.querySelectorAll('input[type="radio"]');
    if (radioInputs) {
      for (var i = 0; i < radioInputs.length; i++) {
        if (radioInputs[i].id !== filterId) {
          radioInputs[i].removeAttribute('checked');
        } else {
          radioInputs[i].checked = true;
        }
      }
    }
  }

  /**
   * Обработчик события 'resizerchange' на объект window,
   * который будет брать значения смещения и размера кадра
   * из объекта resizer и добавлять их в форму
   */
  window.addEventListener('resizerchange', setFormValuesFromResizer, false);

  /**
   * Обработчик изменения значения в ресайз форме.
   * При изменении значений в полях формы меняется отрисовка рамки на картинке
   */
  resizeForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if ((element === resizeForm['resize-x']) || (element === resizeForm['resize-y']) || (element === resizeForm['resize-size'])) {
      currentResizer.setConstraint(resizeForm['resize-x'].value, resizeForm['resize-y'].value, resizeForm['resize-size'].value);
      //currentResizer.redraw();
    }
  });

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();
          currentResizer = new Resizer(fileReader.result);
          currentResizer._image.onload();
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');
          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');
          var filterToSelect = docCookies.getItem('filter');
          selectFilter('upload-filter-' + filterToSelect);
          hideMessage();
          // Вычитка первоначальных данных для ресайз формы
          setFormValuesFromResizer();
        });

        fileReader.readAsDataURL(element.files[0]);

      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });



   /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;
      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
      return true;
    }
    return false;
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

   /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    //Запись в куки выбранного фильтра
    setFilterCookie('filter', selectedFilter.toString());
    cleanupResizer();
    updateBackground();
    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
})();

