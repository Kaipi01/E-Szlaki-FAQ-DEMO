
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