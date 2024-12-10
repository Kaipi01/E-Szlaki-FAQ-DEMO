const modalElement = document.querySelector("#modal-name-1");
new Modal(modalElement);
  class Modal {
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
      this.focusableElString =
      '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
      this.initModal();
    }
    getPreventScrollEl() {
      var scrollEl = false;
      var querySelector = this.element.getAttribute(
        "data-modal-prevent-scroll"
      );
      if (querySelector) scrollEl = document.querySelector(querySelector);
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
      if (this.element.classList.contains(this.showClass))
        this.initModalEvents();

      //window.Modal = Modal;

      //initialize the Modal objects
      //var modals = document.getElementsByClassName("js-modal");
      // generic focusable elements string selector

      window.addEventListener("keydown", (event) => {
        //close modal window on esc
        if (
          (event.keyCode && event.keyCode == 27) ||
          (event.key && event.key.toLowerCase() == "escape")
        ) {
          this.closeModal()
          // for (var i = 0; i < modalArrays.length; i++) {
          //   (function (i) {
          //     modalArrays[i].closeModal();
          //   })(i);
          // }
        }
      });
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

    isVisible(element) {
      return (
        element.offsetWidth ||
        element.offsetHeight ||
        element.getClientRects().length
      );
    }
  }







  const debounce = (callback, delay = this.ANIMATION_DURATION_TIME) => {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const showPageDebounce = debounce((link) => {
    this.showPage(link);
    console.log("Przełączam strone");
  });



  


  const throttle = (callback, delay = this.ANIMATION_DURATION_TIME) => {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
      if (waitingArgs == null) {
        shouldWait = false
      } else {
        callback(...waitingArgs);
        waitingArgs = null
        setTimeout(timeoutFunc, delay)
      }
    }

    return (...args) => {
      if (shouldWait) {
        waitingArgs = args
        return
      }  
      callback(...args); 
      shouldWait = true

      setTimeout(timeoutFunc, delay)
    };
  } 







// Accordions
// class FAQAccordion {
//   constructor(selector) {
//     this.accordions = document.querySelectorAll(selector);
//     if (this.accordions.length > 0 && window.requestAnimationFrame) {
//       this.init();
//     }
//   }

//   static hasClass(el, className) {
//     return el.classList ? el.classList.contains(className) : !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
//   }

//   static addClass(el, className) {
//     const classList = className.split(' ');
//     if (el.classList) el.classList.add(classList[0]);
//     else if (!FAQAccordion.hasClass(el, classList[0])) el.className += ' ' + classList[0];
//     if (classList.length > 1) FAQAccordion.addClass(el, classList.slice(1).join(' '));
//   }

//   static removeClass(el, className) {
//     const classList = className.split(' ');
//     if (el.classList) el.classList.remove(classList[0]);
//     else if (FAQAccordion.hasClass(el, classList[0])) {
//       const reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
//       el.className = el.className.replace(reg, ' ');
//     }
//     if (classList.length > 1) FAQAccordion.removeClass(el, classList.slice(1).join(' '));
//   }

//   static setHeight(start, to, element, duration, cb) {
//     const change = to - start;
//     let currentTime = null;

//     const animateHeight = (timestamp) => {
//       if (!currentTime) currentTime = timestamp;
//       const progress = timestamp - currentTime;
//       const val = parseInt((progress / duration) * change + start, 10);
//       element.style.height = val + 'px';
//       if (progress < duration) {
//         window.requestAnimationFrame(animateHeight);
//       } else {
//         cb();
//       }
//     };

//     element.style.height = start + 'px';
//     window.requestAnimationFrame(animateHeight);
//   }

//   init() {
//     this.accordions.forEach((accordion) => {
//       accordion.addEventListener('change', (event) => this.animateAccordion(event.target));
//     });
//   }

//   animateAccordion(input) {
//     const isChecked = input.checked;
//     const dropdown = input.parentNode.querySelector('.cd-accordion__sub');

//     FAQAccordion.addClass(dropdown, 'cd-accordion__sub--is-visible');

//     const initialHeight = !isChecked ? dropdown.offsetHeight : 0;
//     const finalHeight = !isChecked ? 0 : dropdown.offsetHeight;

//     FAQAccordion.setHeight(initialHeight, finalHeight, dropdown, 200, () => {
//       FAQAccordion.removeClass(dropdown, 'cd-accordion__sub--is-visible');
//       dropdown.removeAttribute('style');
//     });
//   }
// }

/* 
// Utility function
function Util () {};



Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};



Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};



Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.setAttribute("style", "height:"+val+"px;");
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.setAttribute("style", "height:"+start+"px;");
  window.requestAnimationFrame(animateHeight);
};



Util.scrollTo = function(final, duration, cb) {
  var start = window.scrollY || document.documentElement.scrollTop,
      currentTime = null;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    window.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};


//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};






(function() {
  // Multi-Level Accordion Menu - by CodyHouse.co
  var accordionsMenu = document.getElementsByClassName('faq-accordion--animated');

	if( accordionsMenu.length > 0 && window.requestAnimationFrame) {
		for(var i = 0; i < accordionsMenu.length; i++) {(function(i){
			accordionsMenu[i].addEventListener('change', function(event){
				animateAccordion(event.target);
			});
		})(i);}

		function animateAccordion(input) {
			var bool = input.checked,
				dropdown =  input.parentNode.getElementsByClassName('faq-accordion__sub')[0];
			
			Util.addClass(dropdown, 'faq-accordion__sub--is-visible'); // make sure subnav is visible while animating height

			var initHeight = !bool ? dropdown.offsetHeight: 0,
				finalHeight = !bool ? 0 : dropdown.offsetHeight;

			Util.setHeight(initHeight, finalHeight, dropdown, 200, function(){
				Util.removeClass(dropdown, 'faq-accordion__sub--is-visible');
				dropdown.removeAttribute('style');
			});
		}
	}
}());

*/