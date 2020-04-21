
class Nue {
  
  constructor(options) {
    this.root = document.querySelector(options.el);
    this.rawData = options.data;
    this.methods = options.methods;
    this.data = this.observe(this.rawData);

    this.registerMethods();
    this.registerListeners();
    this.refreshDom();
  }

  get directives() {
    return {
      'n-text': (element, value) => {
        element.innerText = value;
      },

      'n-show': (element, value) => {
        element.style.display = value ? '' : 'none';
      }
    }
  }

  observe(data) {
    const self = this;

    return new Proxy(data, {
      set(target, key, value) {
        target[key] = value;

        self.refreshDom();
      }
    });
  }

  registerMethods() {
    for (let method in this.methods) {
      this[method] = this.methods[method];
    }
  }

  registerListeners() {
    this.walkDom(this.root, element => {
      Array.from(element.attributes).forEach(attribute => {
        if (! attribute.name.startsWith('@')) {
          return;
        }
  
        const event = attribute.name.replace('@', '');
  
        element.addEventListener(event, () => {
          const expression = attribute.value;

          !!this[expression] 
            ? this[expression]()
            : evaluate(this.data, expression);
        });
      });
    });
  }

  refreshDom() {
    this.walkDom(this.root, element => {
      Array.from(element.attributes).forEach(attribute => {
        if (! Object.keys(this.directives).includes(attribute.name)) {
          return;
        }
        
        const value = evaluate(this.data, attribute.value);

        this.directives[attribute.name](element, value);
      });
    });
  }

  walkDom(element, callback) {
    callback(element);

    element = element.firstElementChild;

    while (element) {
      this.walkDom(element, callback);

      element = element.nextElementSibling;
    }
  }
}

function evaluate(data, value) {
  return eval(`with (data) { (${value}) }`);
}
