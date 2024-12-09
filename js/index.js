document.addEventListener("DOMContentLoaded", function () {
  const themeTogglerBtn = document.querySelector("#toggle-theme-btn input");
  themeTogglerBtn.addEventListener("change", toggleTheme);

  new FAQAccordionModule(".cd-accordion--animated");
});

// pomoc

function toggleTheme() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
  }
}

class FAQAccordionModule {
  constructor() {
    //Closest() method
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (s) {
        const el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
          if (el.matches(s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }

    //Custom Event() constructor
    if (typeof window.CustomEvent !== "function") {
      function CustomEvent(event, params) {
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: undefined,
        };
        const evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(
          event,
          params.bubbles,
          params.cancelable,
          params.detail
        );
        return evt;
      }

      CustomEvent.prototype = window.Event.prototype;

      window.CustomEvent = CustomEvent;
    }

    this.init();
  }

  init() { 
    const accordionsMenu = document.getElementsByClassName(
      "faq-accordion--animated"
    );

    if (accordionsMenu.length > 0 && window.requestAnimationFrame) {
      for (let i = 0; i < accordionsMenu.length; i++) {
        accordionsMenu[i].addEventListener("change", (event) => {
          this.animateAccordion(event.target);
        });
      }
    }
  }

  animateAccordion(input) {
    const bool = input.checked,
      dropdown =
        input.parentNode.getElementsByClassName("faq-accordion__sub")[0];

    this.addClass(dropdown, "faq-accordion__sub--is-visible"); // make sure subnav is visible while animating height

    const initHeight = !bool ? dropdown.offsetHeight : 0,
      finalHeight = !bool ? 0 : dropdown.offsetHeight;

    this.setHeight(initHeight, finalHeight, dropdown, 200, () => {
      this.removeClass(dropdown, "faq-accordion__sub--is-visible");
      dropdown.removeAttribute("style");
    });
  }

  hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);
    else
      return !!el.className.match(
        new RegExp("(\\s|^)" + className + "(\\s|$)")
      );
  };

  addClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.add(classList[0]);
    else if (!this.hasClass(el, classList[0]))
      el.className += " " + classList[0];
    if (classList.length > 1) this.addClass(el, classList.slice(1).join(" "));
  };

  removeClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.remove(classList[0]);
    else if (this.hasClass(el, classList[0])) {
      const reg = new RegExp("(\\s|^)" + classList[0] + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
    if (classList.length > 1)
      this.removeClass(el, classList.slice(1).join(" "));
  };

  toggleClass(el, className, bool) {
    if (bool) this.addClass(el, className);
    else this.removeClass(el, className);
  };

  setAttributes(el, attrs) {
    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  };

  getChildrenByClassName(el, className) {
    const children = el.children,
      childrenByClass = [];
    for (let i = 0; i < el.children.length; i++) {
      if (this.hasClass(el.children[i], className))
        childrenByClass.push(el.children[i]);
    }
    return childrenByClass;
  };

  setHeight(start, to, element, duration, cb) {
    let change = to - start,
      currentTime = null;

    const animateHeight = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      const progress = timestamp - currentTime;
      const val = parseInt((progress / duration) * change + start);
      element.setAttribute("style", "height:" + val + "px;");
      if (progress < duration) {
        window.requestAnimationFrame(animateHeight);
      } else {
        cb();
      }
    };

    // set the height of the element before starting animation -> fix bug on Safari
    element.setAttribute("style", "height:" + start + "px;");
    window.requestAnimationFrame(animateHeight);
  };

  scrollTo(final, duration, cb) {
    const start = window.scrollY || document.documentElement.scrollTop,
      currentTime = null;

    const animateScroll = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      const progress = timestamp - currentTime;
      if (progress > duration) progress = duration;
      const val = this.easeInOutQuad(progress, start, final - start, duration);
      window.scrollTo(0, val);
      if (progress < duration) {
        window.requestAnimationFrame(animateScroll);
      } else {
        cb && cb();
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

  //Move focus to an element
  moveFocus(element) {
    if (!element) element = document.getElementsByTagName("body")[0];
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute("tabindex", "-1");
      element.focus();
    }
  };

  getIndexInArray(array, el) {
    return Array.prototype.indexOf.call(array, el);
  };

  cssSupports(property, value) {
    if ("CSS" in window) {
      return CSS.supports(property, value);
    } else {
      const jsProperty = property.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
      return jsProperty in document.body.style;
    }
  };

  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };
}