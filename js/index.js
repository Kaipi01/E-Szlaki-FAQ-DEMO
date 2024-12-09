const toast = document.querySelector("#toast");
const toastTimer = document.querySelector("#timer");
const closeToastBtn = document.querySelector("#toast-close");
let countdown;

const closeToast = () => {
  toast.style.animation = "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
  toastTimer.classList.remove("timer-animation");
  clearTimeout(countdown);

  setTimeout(() => {
    toast.style.display = "none";
  }, 300);
};

const openToast = (type) => {
  if (toast.style.display != "none") return

  toast.style.display = "flex";

  setTimeout(() => {
    toast.classList = [type];
    toast.style.animation = "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
    toastTimer.classList.add("timer-animation");
    clearTimeout(countdown);
    countdown = setTimeout(() => {
      closeToast();
    }, 5000);
  }, 0);
};

document.querySelector("#toast-button-test").addEventListener("click", (e) => {
  openToast("success");
});

closeToastBtn.addEventListener("click", closeToast);

document.addEventListener("DOMContentLoaded", function () {
  // const themeTogglerBtn = document.querySelector("#toggle-theme-btn input");
  // themeTogglerBtn.addEventListener("change", toggleTheme);

  new FAQAccordionModule(".cd-accordion--animated");

  // linki są dynamicznie generowane na podstawie atrybutu "data-screen"
  new ContentScreens("#more-information-module");
});

// pomoc

function toggleTheme() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
  }
}

class ContentScreens {
  constructor(mainContainerSelector) {
    this.mainContainer = document.querySelector(mainContainerSelector);
    this.menuList = this.mainContainer.querySelector(".main-menu-list");
    this.screens = this.mainContainer.querySelectorAll(".screen-page");
    this.pageLinks = [];
    this.linkPage = "";
    this.init();
  }

  init() {
    this.generateNavigation();
    this.pageLinks = this.mainContainer.querySelectorAll(".link-page");
    this.bindPageLinks();
    this.showPage(this.pageLinks[0]);
  }

  generateNavigation() {
    this.screens.forEach((screen) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      const screenData = this.getScreenData(screen);

      link.href = `#${screenData.slug}`;
      link.className = "link-page";
      link.textContent = screenData.name;
      li.appendChild(link);

      this.menuList.appendChild(li);
    });
  }

  bindPageLinks() {
    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.showPage(link);
      });
    });
  }

  showPage(link) {
    const activeMenu = this.mainContainer.querySelector(".link-page.active");
    const prevActivePage = this.mainContainer.querySelector(
      ".screen-page-active"
    );

    activeMenu?.classList.remove("active");

    link.classList.add("active");
    this.linkPage = link.getAttribute("href").split("#")[1];

    this.screens.forEach((screen) => {
      const screenData = this.getScreenData(screen);

      if (screenData.slug === this.linkPage) {
        this.animateChangePages(prevActivePage, screen);
      }
    });
  }

  animateChangePages(prevPage, nextPage) {
    if (prevPage === nextPage) return;

    this.screens.forEach((screen) => (screen.style.position = "absolute"));

    if (prevPage) {
      prevPage.classList.remove("screen-page-active");
      //prevPage.style.position = "absolute";
    }
    nextPage.classList.add("screen-page-active");

    setTimeout(() => {
      nextPage.style.position = "relative";
    }, 601);
  }

  getScreenData(screen) {
    return JSON.parse(screen.dataset.screen);
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
  }

  addClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.add(classList[0]);
    else if (!this.hasClass(el, classList[0]))
      el.className += " " + classList[0];
    if (classList.length > 1) this.addClass(el, classList.slice(1).join(" "));
  }

  removeClass(el, className) {
    const classList = className.split(" ");
    if (el.classList) el.classList.remove(classList[0]);
    else if (this.hasClass(el, classList[0])) {
      const reg = new RegExp("(\\s|^)" + classList[0] + "(\\s|$)");
      el.className = el.className.replace(reg, " ");
    }
    if (classList.length > 1)
      this.removeClass(el, classList.slice(1).join(" "));
  }

  toggleClass(el, className, bool) {
    if (bool) this.addClass(el, className);
    else this.removeClass(el, className);
  }

  setAttributes(el, attrs) {
    for (const key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  getChildrenByClassName(el, className) {
    const children = el.children,
      childrenByClass = [];
    for (let i = 0; i < el.children.length; i++) {
      if (this.hasClass(el.children[i], className))
        childrenByClass.push(el.children[i]);
    }
    return childrenByClass;
  }

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
  }

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
  }

  //Move focus to an element
  moveFocus(element) {
    if (!element) element = document.getElementsByTagName("body")[0];
    element.focus();
    if (document.activeElement !== element) {
      element.setAttribute("tabindex", "-1");
      element.focus();
    }
  }

  getIndexInArray(array, el) {
    return Array.prototype.indexOf.call(array, el);
  }

  cssSupports(property, value) {
    if ("CSS" in window) {
      return CSS.supports(property, value);
    } else {
      const jsProperty = property.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
      return jsProperty in document.body.style;
    }
  }

  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }
}

// File#: _1_modal-window
// Usage: codyhouse.co/license
(function () {
  var Modal = function (element) {
    this.element = element;
    this.triggers = document.querySelectorAll(
      '[aria-controls="' + this.element.getAttribute("id") + '"]'
    );
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null; // focus will be moved to this element when modal is open
    this.modalFocus = this.element.getAttribute("data-modal-first-focus")
      ? this.element.querySelector(
          this.element.getAttribute("data-modal-first-focus")
        )
      : null;
    this.selectedTrigger = null;
    this.preventScrollEl = this.getPreventScrollEl();
    this.showClass = "modal--is-visible";
    this.initModal();
  };

  Modal.prototype.getPreventScrollEl = function () {
    var scrollEl = false;
    var querySelector = this.element.getAttribute("data-modal-prevent-scroll");
    if (querySelector) scrollEl = document.querySelector(querySelector);
    return scrollEl;
  };

  Modal.prototype.initModal = function () {
    var self = this;
    //open modal when clicking on trigger buttons
    if (this.triggers) {
      for (var i = 0; i < this.triggers.length; i++) {
        this.triggers[i].addEventListener("click", function (event) {
          event.preventDefault();
          if (self.element.classList.contains(self.showClass)) {
            self.closeModal();
            return;
          }
          self.selectedTrigger = event.currentTarget;
          self.showModal();
          self.initModalEvents();
        });
      }
    }

    // listen to the openModal event -> open modal without a trigger button
    this.element.addEventListener("openModal", function (event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.showModal();
      self.initModalEvents();
    });

    // listen to the closeModal event -> close modal without a trigger button
    this.element.addEventListener("closeModal", function (event) {
      if (event.detail) self.selectedTrigger = event.detail;
      self.closeModal();
    });

    // if modal is open by default -> initialise modal events
    if (this.element.classList.contains(this.showClass)) this.initModalEvents();
  };

  Modal.prototype.showModal = function () {
    var self = this;
    this.element.classList.add(this.showClass);
    this.getFocusableElements();
    if (this.moveFocusEl) {
      this.moveFocusEl.focus();
      // wait for the end of transitions before moving focus
      this.element.addEventListener("transitionend", function cb(event) {
        self.moveFocusEl.focus();
        self.element.removeEventListener("transitionend", cb);
      });
    }
    this.emitModalEvents("modalIsOpen");
    // change the overflow of the preventScrollEl
    if (this.preventScrollEl) this.preventScrollEl.style.overflow = "hidden";
  };

  Modal.prototype.closeModal = function () {
    if (!this.element.classList.contains(this.showClass)) return;
    this.element.classList.remove(this.showClass);
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.moveFocusEl = null;
    if (this.selectedTrigger) this.selectedTrigger.focus();
    //remove listeners
    this.cancelModalEvents();
    this.emitModalEvents("modalIsClose");
    // change the overflow of the preventScrollEl
    if (this.preventScrollEl) this.preventScrollEl.style.overflow = "";
  };

  Modal.prototype.initModalEvents = function () {
    //add event listeners
    this.element.addEventListener("keydown", this);
    this.element.addEventListener("click", this);
  };

  Modal.prototype.cancelModalEvents = function () {
    //remove event listeners
    this.element.removeEventListener("keydown", this);
    this.element.removeEventListener("click", this);
  };

  Modal.prototype.handleEvent = function (event) {
    switch (event.type) {
      case "click": {
        this.initClick(event);
      }
      case "keydown": {
        this.initKeyDown(event);
      }
    }
  };

  Modal.prototype.initKeyDown = function (event) {
    if (
      (event.keyCode && event.keyCode == 9) ||
      (event.key && event.key == "Tab")
    ) {
      //trap focus inside modal
      this.trapFocus(event);
    } else if (
      ((event.keyCode && event.keyCode == 13) ||
        (event.key && event.key == "Enter")) &&
      event.target.closest(".js-modal__close")
    ) {
      event.preventDefault();
      this.closeModal(); // close modal when pressing Enter on close button
    }
  };

  Modal.prototype.initClick = function (event) {
    //close modal when clicking on close button or modal bg layer
    if (
      !event.target.closest(".js-modal__close") &&
      !event.target.classList.contains("js-modal")
    )
      return;
    event.preventDefault();
    this.closeModal();
  };

  Modal.prototype.trapFocus = function (event) {
    if (this.firstFocusable == document.activeElement && event.shiftKey) {
      //on Shift+Tab -> focus last focusable element when focus moves out of modal
      event.preventDefault();
      this.lastFocusable.focus();
    }
    if (this.lastFocusable == document.activeElement && !event.shiftKey) {
      //on Tab -> focus first focusable element when focus moves out of modal
      event.preventDefault();
      this.firstFocusable.focus();
    }
  };

  Modal.prototype.getFocusableElements = function () {
    //get all focusable elements inside the modal
    var allFocusable = this.element.querySelectorAll(focusableElString);
    this.getFirstVisible(allFocusable);
    this.getLastVisible(allFocusable);
    this.getFirstFocusable();
  };

  Modal.prototype.getFirstVisible = function (elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (isVisible(elements[i])) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  };

  Modal.prototype.getLastVisible = function (elements) {
    //get last visible focusable element inside the modal
    for (var i = elements.length - 1; i >= 0; i--) {
      if (isVisible(elements[i])) {
        this.lastFocusable = elements[i];
        break;
      }
    }
  };

  Modal.prototype.getFirstFocusable = function () {
    if (!this.modalFocus || !Element.prototype.matches) {
      this.moveFocusEl = this.firstFocusable;
      return;
    }
    var containerIsFocusable = this.modalFocus.matches(focusableElString);
    if (containerIsFocusable) {
      this.moveFocusEl = this.modalFocus;
    } else {
      this.moveFocusEl = false;
      var elements = this.modalFocus.querySelectorAll(focusableElString);
      for (var i = 0; i < elements.length; i++) {
        if (isVisible(elements[i])) {
          this.moveFocusEl = elements[i];
          break;
        }
      }
      if (!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
    }
  };

  Modal.prototype.emitModalEvents = function (eventName) {
    var event = new CustomEvent(eventName, { detail: this.selectedTrigger });
    this.element.dispatchEvent(event);
  };

  function isVisible(element) {
    return (
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }

  window.Modal = Modal;

  //initialize the Modal objects
  var modals = document.getElementsByClassName("js-modal");
  // generic focusable elements string selector
  var focusableElString =
    '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
  if (modals.length > 0) {
    var modalArrays = [];
    for (var i = 0; i < modals.length; i++) {
      (function (i) {
        modalArrays.push(new Modal(modals[i]));
      })(i);
    }

    window.addEventListener("keydown", function (event) {
      //close modal window on esc
      if (
        (event.keyCode && event.keyCode == 27) ||
        (event.key && event.key.toLowerCase() == "escape")
      ) {
        for (var i = 0; i < modalArrays.length; i++) {
          (function (i) {
            modalArrays[i].closeModal();
          })(i);
        }
      }
    });
  }
})();
