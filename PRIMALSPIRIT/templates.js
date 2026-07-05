
// Тестовая система шаблонов для Primal Spirit
const templates = {
    animalCard: `
    <div class="spirit-card">
      <div class="spirit-name">{{name}}</div>
      <div class="spirit-symbol">Видит в тебе {{symbol}}</div>
      <div class="spirit-emoji"><img class="animals-images" src="{{logo}}" alt="{{name}}"></div>
      <div class="spirit-symbol">{{gift}}</div>
      <button class="totem-btn" data-animal="{{name}}">
        ВЫБРАТЬ
      </button>
    </div>
  `,

    // Шаблон карточки тотема (архетип с животными)
    totemCard: `
    <div class="totem-card">
      <h3>{{archetype}}</h3>
      <div class="totem-animals">
        {{animalsList}}
      </div>
      <p>{{archetypeDescription}}</p>
      <p class="totem-gift"><strong>Дар:</strong> {{archetypeGift}}</p>
    </div>
  `,

  // Шаблон животного в тотеме (обновленный с возможностью ссылки)
  totemAnimalItem: `
  <a href="{{link}}" class="totem-link" target="_blank">
    <div class="totem-animal">
      <img class="animals-images-totem" src="{{logo}}" alt="{{name}}">
      <span class="animal-name">{{name}} | <span class="vk_text">VK</span></span>
    </div>
  </a>
  `,

    // Шаблон вопроса
    questionTemplate: `
    <div class="question-text">{{text}}</div>
    <div class="options">{{options}}</div>
  `,

    // Шаблон варианта ответа
    optionTemplate: `
    <div class="option">
      <div><img class="test-icons" src="{{icon}}" alt="{{value}}" class="option-icon"></div>
      <div class="option-label">{{value}}</div>
    </div>
  `,

    // Шаблон элемента прогресс-бара (клетка с иконкой)
    progressCell: `
    <div class="square-image {{cellClass}} {{positionClass}}" id="{{cellId}}">
      {{iconContent}}
    </div>
  `,

    // Шаблон лоадера
    loaderTemplate: `
    <div id="loader" class="loader">
      <div class="loader-text">PRIMAL SPIRIT</div>
      <div class="loader-subtext">Загрузка тотемов...</div>
    </div>
  `,

    // Шаблон контейнера вопросов
    questionContainerTemplate: `
    <div class="question-container" id="questionContainer">
      <div class="question-text" id="questionText"></div>
      <div class="options" id="optionsContainer"></div>
    </div>
  `,
    // Шаблон полной страницы животного
    animalFullPageTemplate: `
    <div class="animal-page">
      <div class="animal-page-header">
        {{headerHTML}}
      </div>
      <div class="animal-page-content">
        {{poemHTML}}
        <div class="animal-totems-section">
          <h3 class="totems-title">Тотемы духа {{animalName}}</h3>
          <div class="totems-subtitle">
            Выбери архетип, который тебе ближе
          </div>
          <div class="totems-container">
            {{totemsCardsHTML}}
          </div>
        </div>
      </div>
      <div class="animal-page-footer">
        {{getButtonHTML}}
        <button class="back-btn" id="backToResults">← Назад к выбору</button>
      </div>
    </div>
    `,

    // Шаблон секции результатов
    resultsSectionTemplate: `
    <div class="results-section" id="resultsSection">
      <div class="results-title">Эти духи следуют за тобой</div>
      <div class="results-subtitle">Выбирай, кто тебе ближе</div>
      <div class="spirits-grid" id="spiritsGrid"></div>
    </div>
  `,

    // Шаблон секции выбора животных
    animalSelectionTemplate: `
    <div class="animal-selection" id="animalSelection">
      <div class="results-title">Сделай свой выбор</div>
      <div class="results-subtitle">Эти духи следуют за тобой</div>
      <div class="spirits-grid" id="animalSelectionGrid"></div>
    </div>
  `,

    // Шаблон секции тотемов
    totemSectionTemplate: `
    <div class="totem-section" id="totemSection">

      <div class="results-title"><span id="selectedAnimalName"></span></div>
      <div class="results-subtitle"></div>
      <div class="totem-container" id="totemContainer"></div>
      <button class="back-btn" id="backToResults">← Назад</button>
    </div>
  `,

// Шаблон заголовка страницы животного
  animalHeaderTemplate: `
    <div class="animal-header">
      <div class="animal-header-info">
        <h1 class="animal-header-title">{{name}}</h1>
      </div>

      <div class="animal-header-description">
          {{unique_characteristic}}
      </div>

      <div class="animal-header-description">
          {{description}}
      </div>
      
      <div class="animal-header-content">
        <div class="animal-header-image">
          <img src="{{logo}}" alt="{{name}}" class="animal-header-logo">
          <div class="animal-header-symbol">
            <strong>Дарует </strong> {{symbol}}
          </div>

        </div>
      </div>
    </div>
  `,

    // Шаблон поэмы животного
    animalPoemTemplate: `
    <div class="animal-poem-section">
      <h3 class="poem-title">Песнь духа</h3>
      <div class="poem-content">
        {{poem}}
      </div>
    </div>
  `,

    // Шаблон секции тотемов для животного
    animalTotemsSection: `
    <div class="animal-totems-section">
      <h3 class="totems-title">Тотемы духа {{name}}</h3>
      <div class="totems-subtitle">
        Выбери архетип, который тебе ближе
      </div>
      <div class="totems-container" id="totemsContainer"></div>
    </div>
  `,

    // Шаблон кнопки получения
    getButtonTemplate: `
    <div class="get-button-container">
      <a href="{{link}}" class="get-button" target="_blank">
        ПОЛУЧИТЬ ТОТЕМ
      </a>
    </div>
  `,

    // Шаблон полной страницы животного с тотемами
    animalPageTemplate: `
    <div class="animal-page">
      <div class="animal-page-header">
        {{header}}
      </div>
      <div class="animal-page-content">
        {{poem}}
        {{totemsSection}}
      </div>
      <div class="animal-page-footer">
        {{getButton}}
        <button class="back-btn" id="backToResults">← Назад к выбору</button>
      </div>
    </div>
  `
};

const TemplateEngine = {
    render(templateName, data = {}) {
        if (!templates[templateName]) {
            console.error(`Шаблон "${templateName}" не найден`);
            return '';
        }

        let html = templates[templateName];

        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(placeholder, this.escapeHtml(value));
        }

        html = html.replace(/{{\w+}}/g, '');

        return html;
    },

    renderRaw(templateName, data = {}) {
        if (!templates[templateName]) {
            console.error(`Шаблон "${templateName}" не найден`);
            return '';
        }

        let html = templates[templateName];

        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(placeholder, value || '');
        }

        html = html.replace(/{{\w+}}/g, '');

        return html;
    },

    renderList(templateName, items, itemRenderer) {
        let result = '';
        items.forEach((item, index) => {
            result += itemRenderer(item, index);
        });
        return result;
    },

    escapeHtml(text) {
        if (typeof text !== 'string') return text;

        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, m => map[m]);
    },

    createElement(templateName, data = {}) {
        const html = this.render(templateName, data);
        const container = document.createElement('div');
        container.innerHTML = html;
        return container.firstElementChild;
    },

    insertInto(containerId, templateName, data = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Контейнер #${containerId} не найден`);
            return null;
        }

        const element = this.createElement(templateName, data);
        container.innerHTML = '';
        container.appendChild(element);
        return element;
    },

    updateElement(element, templateName, data = {}) {
        if (!element) return null;

        const newElement = this.createElement(templateName, data);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }
};
