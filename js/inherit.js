'use strict';

/**
 * Функция inherit(child: Function, parent: Function),
 * которая принимает два конструктора и записывает в прототип дочернего
 * конструктора child методы и свойства родительского конструктора parent
 * через пустой конструктор
 */
define(function() {
  function inherit(child, parent) {
    var EmptyCtor = function() {};
    EmptyCtor.prototype = parent.prototype;
    child.prototype = new EmptyCtor();
  }
  return inherit;
});
