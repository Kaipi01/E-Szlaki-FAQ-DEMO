document.addEventListener("DOMContentLoaded", function () {
  const FAQ_MODULE_ID_SELECTOR = "#FAQ-modul-e-szlaki";
  const FAQ_CONTACT_MODAL_ID_SELECTOR = "#FAQ-modul-e-szlaki-contact-modal";
  
  // const themeTogglerBtn = document.querySelector("#toggle-theme-btn input");
  // themeTogglerBtn.addEventListener("change", toggleTheme);

  const faqModuleToast = new FAQModuleToast(
    FAQ_MODULE_ID_SELECTOR + " .faq-contact-form-toast"
  );
  //faqModuleToast.open("success");
  // warning
  // success
  // error

  const faqContactModalEl = document.querySelector(FAQ_CONTACT_MODAL_ID_SELECTOR)
  const faqContactModal = new FAQModuleContactModal(faqContactModalEl)

  new FAQAccordionModule(
    FAQ_MODULE_ID_SELECTOR + " .faq-accordion.faq-accordion--animated"
  );
 
  new FAQModuleContentScreens(FAQ_MODULE_ID_SELECTOR);

  window.addEventListener("keydown", (event) => {
    //close modal window on esc
    if (event.key && event.key.toLowerCase() == "escape") {
      faqContactModal.closeModal()
    }
  }); 
});

// pomoc

function toggleTheme() {
  const documentBody = document.body;

  if (documentBody.classList.contains("dark")) {
    documentBody.classList.remove("dark");
  } else {
    documentBody.classList.add("dark");
  }
}

class FAQModuleContentScreens {
  constructor(mainContainerSelector) {
    this.ANIMATION_DURATION_TIME = 400;
    this.mainContainer = document.querySelector(mainContainerSelector); 
    this.screens = this.mainContainer.querySelectorAll(".screen-page");
    this.pageLinks = [];
    this.linkPage = "";
    this.init();
  }

  init() { 
    this.pageLinks = this.mainContainer.querySelectorAll(".faq-category-link");
    this.bindPageLinks();
    this.showPage(this.pageLinks[0]);
  } 

  bindPageLinks() {
    // Mechanizm throttle do zabezpieczenia animacji
    const throttle = (callback, delay = this.ANIMATION_DURATION_TIME) => {
      let shouldWait = false;

      return (...args) => {
        if (shouldWait) return;

        callback(...args);
        shouldWait = true;

        setTimeout(() => {
          shouldWait = false;
        }, delay);
      };
    };

    const showPageThrottle = throttle((link) => {
      this.showPage(link);
    });

    this.pageLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault(); // TODO: Wyłącz dla mniejszych rozdzielczości
        showPageThrottle(link);
      });
    });
  }

  showPage(link) {
    const activeMenu = this.mainContainer.querySelector(".faq-category-link.active");
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
    }
    nextPage.classList.add("screen-page-active");

    setTimeout(() => {
      nextPage.style.position = "relative";
    }, this.ANIMATION_DURATION_TIME + 1);
  }

  getScreenData(screen) {
    return JSON.parse(screen.dataset.screen);
  }
}

class FAQModuleToast {
  constructor(selector) {
    this.toast = document.querySelector(selector);
    this.toastTimer = this.toast.querySelector(".timer");
    this.closeToastBtn = this.toast.querySelector(".toast-close");
    this.countdown;
    this.closeToastBtn.addEventListener("click", this.close);
  }

  close() {
    this.toast.style.animation =
      "close 0.3s cubic-bezier(.87,-1,.57,.97) forwards";
    this.toastTimer.classList.remove("timer-animation");
    clearTimeout(this.countdown);

    setTimeout(() => {
      this.toast.style.display = "none";
    }, 300);
  }

  open(type) {
    if (this.toast.style.display != "none") return;

    this.toast.style.display = "flex";

    setTimeout(() => {
      this.toast.classList.add(type);
      this.toast.style.animation =
        "open 0.3s cubic-bezier(.47,.02,.44,2) forwards";
      this.toastTimer.classList.add("timer-animation");
      clearTimeout(this.countdown);
      this.countdown = setTimeout(() => {
        this.close();
      }, 5000);
    }, 0);
  }
}

class FAQAccordionModule {
  constructor(accordionsMenuSelector) {
    this.accordionsMenuSelector = accordionsMenuSelector;

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

    // Custom Event() constructor
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
    const accordionsMenu = document.querySelectorAll(
      this.accordionsMenuSelector
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

class FAQModuleContactModal {
  constructor(element) {
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
    this.focusableElString =
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
  }

  isVisible(element) {
    return (
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    );
  }
  getPreventScrollEl() {
    var scrollEl = document.body;
    return scrollEl;
  }
  initModal() {
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
  }
  showModal() {
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
  }
  closeModal() {
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
  }
  initModalEvents() {
    //add event listeners
    this.element.addEventListener("keydown", this);
    this.element.addEventListener("click", this);
  }
  cancelModalEvents() {
    //remove event listeners
    this.element.removeEventListener("keydown", this);
    this.element.removeEventListener("click", this);
  }
  handleEvent(event) {
    switch (event.type) {
      case "click": {
        this.initClick(event);
      }
      case "keydown": {
        this.initKeyDown(event);
      }
    }
  }
  initKeyDown(event) {
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
  }
  initClick(event) {
    //close modal when clicking on close button or modal bg layer
    if (
      !event.target.closest(".js-modal__close") &&
      !event.target.classList.contains("js-modal")
    )
      return;
    event.preventDefault();
    this.closeModal();
  }
  trapFocus(event) {
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
  }
  getFocusableElements() {
    //get all focusable elements inside the modal
    var allFocusable = this.element.querySelectorAll(this.focusableElString);
    this.getFirstVisible(allFocusable);
    this.getLastVisible(allFocusable);
    this.getFirstFocusable();
  }
  getFirstVisible(elements) {
    //get first visible focusable element inside the modal
    for (var i = 0; i < elements.length; i++) {
      if (this.isVisible(elements[i])) {
        this.firstFocusable = elements[i];
        break;
      }
    }
  }
  getLastVisible(elements) {
    //get last visible focusable element inside the modal
    for (var i = elements.length - 1; i >= 0; i--) {
      if (this.isVisible(elements[i])) {
        this.lastFocusable = elements[i];
        break;
      }
    }
  }
  getFirstFocusable() {
    if (!this.modalFocus || !Element.prototype.matches) {
      this.moveFocusEl = this.firstFocusable;
      return;
    }
    var containerIsFocusable = this.modalFocus.matches(this.focusableElString);
    if (containerIsFocusable) {
      this.moveFocusEl = this.modalFocus;
    } else {
      this.moveFocusEl = false;
      var elements = this.modalFocus.querySelectorAll(this.focusableElString);
      for (var i = 0; i < elements.length; i++) {
        if (this.isVisible(elements[i])) {
          this.moveFocusEl = elements[i];
          break;
        }
      }
      if (!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
    }
  }
  emitModalEvents(eventName) {
    var event = new CustomEvent(eventName, { detail: this.selectedTrigger });
    this.element.dispatchEvent(event);
  }
}