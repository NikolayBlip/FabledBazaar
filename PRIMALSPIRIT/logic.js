let currentQuestionIndex = 0;
let userAnswers = {};
let topThreeAnimals = [];
let progressCells = {};
let answerHistory = [];
let testSessionId = Date.now();
let answerLog = [];

function init() {
  createProgressCells();
  setupGlobalBackButton();
  displayQuestion();
}

function setupGlobalBackButton() {
  const backButton = document.getElementById('globalBackButton');
  if (!backButton) return;
  
  backButton.addEventListener('click', handleGlobalBack);
}

function handleGlobalBack() {
  const totemSection = document.getElementById('totemSection');
  const resultsSection = document.getElementById('resultsSection');
  const questionContainer = document.getElementById('questionContainer');

  if (totemSection && totemSection.style.display !== 'none') {
    totemSection.style.display = 'none';
    if (resultsSection) {
      resultsSection.style.display = 'block';
    }
    updateGlobalBackButton();
    return;
  }

  if (resultsSection && resultsSection.style.display !== 'none') {
    currentQuestionIndex = 0;
    userAnswers = {};
    answerHistory = [];
    answerLog = [];
    
    resultsSection.style.display = 'none';
    if (questionContainer) {
      questionContainer.style.display = 'block';
    }

    const progressCells = document.querySelectorAll('.square-image');
    if (progressCells.length > 0) {
      progressCells.forEach(el => {
        el.style.display = 'block';
      });
    }

    const squareContainer = document.querySelector('.square-container');
    if (squareContainer) {
      squareContainer.style.display = 'flex';
    }

    for (let i = 1; i <= 12; i++) {
      const qElement = document.getElementById(`q${i}`);
      if (qElement) {
        qElement.innerHTML = '';
        qElement.classList.remove('cell-active');
        qElement.classList.add('cell-inactive');
      }
    }

    displayQuestion();
    updateGlobalBackButton();
    return;
  }

  if (currentQuestionIndex > 0 && questionContainer && questionContainer.style.display !== 'none') {
    rollbackLastAnswer();
  }
}

function rollbackLastAnswer() {
  if (answerHistory.length === 0) return;
  
  const lastState = answerHistory.pop();
  
  currentQuestionIndex = lastState.questionIndex;
  userAnswers = { ...lastState.userAnswers };
  
  if (answerLog.length > 0) {
    answerLog.pop();
  }
  
  if (currentQuestionIndex === 0 && Object.keys(userAnswers).length === 0) {
    answerHistory = [];
    answerLog = [];
  }
  
  updateProgressCellsFromHistory();
  
  displayQuestion();
}

function updateProgressCellsFromHistory() {
  for (let i = 1; i <= 12; i++) {
    const qElement = document.getElementById(`q${i}`);
    if (qElement) {
      qElement.innerHTML = '';
      qElement.classList.remove('cell-active');
      qElement.classList.add('cell-inactive');
    }
  }
  
  let questionCount = 0;
  Object.keys(userAnswers).forEach((questionId) => {
    questionCount++;
    const qElement = document.getElementById(`q${questionCount}`);
    if (qElement) {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const option = question.options.find(opt => opt.value === userAnswers[questionId]);
        if (option && option.icon) {
          qElement.innerHTML = `<img class="small-icon" src="${option.icon}" alt="">`;
          qElement.classList.remove('cell-inactive');
          qElement.classList.add('cell-active');
        }
      }
    }
  });
}

function updateGlobalBackButton() {
  const backButton = document.getElementById('globalBackButton');
  if (!backButton) return;
  
  const totemSection = document.getElementById('totemSection');
  const resultsSection = document.getElementById('resultsSection');
  const questionContainer = document.getElementById('questionContainer');
  
  if ((questionContainer && questionContainer.style.display !== 'none' && currentQuestionIndex > 0) ||
      (resultsSection && resultsSection.style.display !== 'none') ||
      (totemSection && totemSection.style.display !== 'none')) {
    backButton.style.display = 'block';
  } else {
    backButton.style.display = 'none';
  }
}

function createProgressCells() {
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  
  const container = document.getElementById('questionContainer');
  container.innerHTML = '';
  container.style.display = 'block';
  
  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.id = 'questionText';
  questionText.textContent = question.text;
  
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options';
  optionsContainer.id = 'optionsContainer';
  
  const questionContainerElement = document.createElement('div');
  questionContainerElement.className = 'question-container';
  questionContainerElement.appendChild(questionText);
  questionContainerElement.appendChild(optionsContainer);
  
  container.appendChild(questionContainerElement);
  
  question.options.forEach(option => {
    const optionElement = TemplateEngine.createElement('optionTemplate', {
      value: option.value,
      icon: option.icon
    });
    
    optionElement.addEventListener('click', () => {
      handleAnswer(question, option);
    });
    
    optionsContainer.appendChild(optionElement);
  });
  
  updateGlobalBackButton();
}

function handleAnswer(question, option) {
  const selectedValue = option.value;
  const selectedIcon = option.icon;
  const questionIndex = currentQuestionIndex;
  
  answerHistory.push({
    questionIndex: currentQuestionIndex,
    userAnswers: { ...userAnswers }
  });
  
  userAnswers[question.id] = selectedValue;
  
  answerLog.push({
    questionId: question.id,
    questionText: question.text,
    answer: selectedValue,
    timestamp: new Date().toISOString()
  });
  
  const questionNumber = questionIndex + 1;
  const qElement = document.getElementById(`q${questionNumber}`);
  if (qElement) {
    qElement.innerHTML = `<img class="small-icon" src="${selectedIcon}" alt="">`;
    qElement.classList.remove('cell-inactive');
    qElement.classList.add('cell-active');
  }
  
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showResults();
  }
  
  updateGlobalBackButton();
}

function updateProgressBar(percent) {
  document.getElementById('progressBar').style.width = `${percent}%`;
}

function createResultTxtFile() {
  return;
}

function showResults() {
  const progressCells = document.querySelectorAll('.square-image');
  if (progressCells.length > 0) {
    progressCells.forEach(el => {
      el.style.display = 'none';
    });
  }
  
  const questionContainer = document.getElementById('questionContainer');
  if (questionContainer) {
    questionContainer.style.display = 'none';
  }
  
  const scores = animals.map(animal => {
    let score = 0;
    
    questions.forEach(question => {
      let userAnswer = userAnswers[question.id];
      let animalValue = animal[question.id];
      
      if (!userAnswer || animalValue === undefined || animalValue === null) {
        return;
      }
      
      let normalizedAnimalValue = animalValue;
      
      if (question.id === 'activity') {
        userAnswer = userAnswer === 'Днём' ? 'День' : 'Ночь';
        if (typeof animalValue === 'string' && animalValue.includes(',')) {
          normalizedAnimalValue = animalValue.split(', ').includes(userAnswer) ? userAnswer : animalValue;
        }
      } else if (question.id === 'territoriality') {
        userAnswer = userAnswer === 'Дома' ? 'Оседлый' : 'Кочевник';
      } else if (question.id === 'sociality') {
        userAnswer = userAnswer === 'Я одиночка' ? 'Одиночка' : 'Стая';
      } else if (question.id === 'nutrition') {
        userAnswer = userAnswer === 'Стэйк' ? 'Хищник' : 'Травоядный';
        if (typeof animalValue === 'string' && animalValue.includes(',')) {
          normalizedAnimalValue = animalValue.split(', ').includes(userAnswer) ? userAnswer : animalValue;
        }
      } else if (question.id === 'strategy') {
        userAnswer = userAnswer === 'Атакую' ? 'Атака' : 'Защита';
      } else if (question.id === 'mobility') {
        userAnswer = userAnswer === 'Только вперёд' ? 'Активный' : 'Пассивный';
      } else if (question.id === 'appearance') {
        userAnswer = userAnswer === 'Предпочитаю закулисье' ? 'Маскировка' : 'Яркая';
      } else if (question.id === 'creativity') {
        userAnswer = userAnswer === 'Следую зову вдохновения' ? 'Творческая' : 'Техническая';
      } else if (question.id === 'foundation') {
        userAnswer = userAnswer === 'Сила' ? 'Сила' : 'Интеллект';
      } else if (question.id === 'sensory_organ') {
        userAnswer = userAnswer === 'Обонять' ? 'Нос' : userAnswer === 'Видеть' ? 'Глаза' : 'Уши';
      } else if (question.id === 'climate_zone') {
        userAnswer = userAnswer === 'Мне нравиться посвежее' ? 'Холодные' :
          userAnswer === 'Хорошо когда всего в меру' ? 'Умеренные' : 'Тёплые';
      } else if (question.id === 'element') {
        const userElement = userAnswer;
        const animalElement = animal.element;
        
        if (userElement === animalElement) {
          score += 1;
        } else if (
          (userElement === 'ОГОНЬ' && (animalElement === 'ЗЕМЛЯ' || animalElement === 'ВОЗДУХ')) ||
          (userElement === 'ВОДА' && (animalElement === 'ЗЕМЛЯ' || animalElement === 'ВОЗДУХ')) ||
          (userElement === 'ЗЕМЛЯ' && (animalElement === 'ВОДА' || animalElement === 'ОГОНЬ')) ||
          (userElement === 'ВОЗДУХ' && (animalElement === 'ВОДА' || animalElement === 'ОГОНЬ'))
        ) {
          score += 0.25;
        } else {
          score -= 2;
        }
        return;
      }
      
      if (typeof normalizedAnimalValue === 'string' &&
          (normalizedAnimalValue === userAnswer || normalizedAnimalValue.includes(userAnswer))) {
        score += question.weight;
      }
    });
    
    return { animal, score };
  });
  
  scores.sort((a, b) => b.score - a.score);
  topThreeAnimals = scores.slice(0, 3);
  

  
  displayAnimalSelection();
  
  updateGlobalBackButton();
}

function displayAnimalSelection() {
  const totemSection = document.getElementById('totemSection');
  if (totemSection) {
    totemSection.style.display = 'none';
  }
  
  let resultsSection = document.getElementById('resultsSection');
  if (!resultsSection) {
    resultsSection = TemplateEngine.createElement('resultsSectionTemplate', {});
    resultsSection.id = 'resultsSection';
    document.querySelector('.container').appendChild(resultsSection);
  }
  
  resultsSection.style.display = 'block';
  
  const spiritsGrid = document.getElementById('spiritsGrid');
  if (!spiritsGrid) {
    console.error('Контейнер spiritsGrid не найден');
    return;
  }
  
  spiritsGrid.innerHTML = '';
  
  topThreeAnimals.forEach(({ animal, score }) => {
    const cardData = {
      name: animal.name,
      symbol: animal.symbol,
      logo: animal.logo,
      unique_characteristic: animal.unique_characteristic,
      description: animal.description,
      gift: animal.gift,
      element: animal.element,
      score: score.toFixed(2)
    };
    
    const card = TemplateEngine.createElement('animalCard', cardData);
    
    const button = card.querySelector('.totem-btn');
    if (button) {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        showTotemSelection(animal.name);
      });
    }
    
    spiritsGrid.appendChild(card);
  });
  
  updateGlobalBackButton();
}

function showTotemSelection(animalName) {
  const animal = animals.find(a => a.name === animalName);
  if (!animal) {
    alert(`Животное "${animalName}" не найдено`);
    return;
  }
  
  const totems = totemsData[animalName];
  if (!totems || Object.keys(totems).length === 0) {
    alert(`Для ${animalName} нет доступных тотемов`);
    return;
  }
  
  const questionContainer = document.getElementById('questionContainer');
  const resultsSection = document.getElementById('resultsSection');
  
  if (questionContainer) questionContainer.style.display = 'none';
  if (resultsSection) resultsSection.style.display = 'none';
  
  const container = document.getElementById('totemSection');
  if (!container) {
    console.error('Контейнер totemSection не найден');
    return;
  }
  
  container.innerHTML = '';
  
  const headerHTML = TemplateEngine.renderRaw('animalHeaderTemplate', {
    name: animal.name,
    logo: animal.logo,
    render: animal.render,
    symbol: animal.symbol,
    gift: animal.gift,
    description: animal.description,
    unique_characteristic: animal.unique_characteristic
  });
  
  const poemWithBreaks = animal.poem ? animal.poem.replace(/\n/g, '<br>') : '';
  const poemHTML = TemplateEngine.renderRaw('animalPoemTemplate', {
    poem: poemWithBreaks || ''
  });
  
  let totemsCardsHTML = '';
  Object.entries(totems).forEach(([archetype, animalsInTotem]) => {
    const archetypeInfo = archetypesData.find(a => a.name === archetype);
    
    let animalsListHTML = '';
    animalsInTotem.forEach(totemAnimalName => {
      const totemAnimal = animals.find(a => a.name === totemAnimalName);
      if (totemAnimal) {
        const animalLinkObj = animals_links.find(a => a.name === totemAnimalName);
        const link = animalLinkObj ? animalLinkObj.url : '#';
        
        animalsListHTML += TemplateEngine.renderRaw('totemAnimalItem', {
          logo: totemAnimal.logo,
          name: totemAnimal.name,
          link: link
        });
      }
    });
    
    totemsCardsHTML += TemplateEngine.renderRaw('totemCard', {
      archetype: archetype,
      archetypeDescription: archetypeInfo?.description || 'Описание отсутствует',
      animalsList: animalsListHTML,
      archetypeGift: archetypeInfo?.gift || 'Не указан'
    });
  });
  
  const animalLinkObj = animals_links.find(a => a.name === animal.name);
  const link = animalLinkObj ? animalLinkObj.url : '#';

  const getButtonHTML = TemplateEngine.renderRaw('getButtonTemplate', {
    link: link
  });
  
  const animalPageHTML = `
    <div class="animal-page">
      <div class="animal-page-header">
        ${headerHTML}
      </div>
      <div class="animal-page-content">
        ${poemHTML}
        ${getButtonHTML}
        
        <div class="animal-totems-section">
          <h3 class="totems-title">Тотемы духа ${animal.name}</h3>
          <div class="totems-subtitle">
            Выбери архетип, который тебе ближе
          </div>
          <div class="totems-container">
            ${totemsCardsHTML}
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = animalPageHTML;
  
  container.querySelectorAll('.totem-animal').forEach(totemAnimal => {
    const animalName = totemAnimal.querySelector('.animal-name').textContent;
    const animalLinkObj = animals_links.find(a => a.name === animalName);
    if (animalLinkObj && animalLinkObj.url) {
      totemAnimal.style.cursor = 'pointer';
      totemAnimal.addEventListener('click', () => {
        window.open(animalLinkObj.url, '_blank');
      });
    }
  });
  
  container.style.display = 'block';
  
  updateGlobalBackButton();
}

function getAllImageUrls() {
  const urls = new Set();
  
  questions.forEach(q => {
    q.options.forEach(opt => {
      if (opt.icon) urls.add(opt.icon);
    });
  });
  
  animals.forEach(animal => {
    if (animal.logo) urls.add(animal.logo);
  });
  
  Object.values(totemsData).forEach(totemGroup => {
    Object.values(totemGroup).forEach(animalList => {
      animalList.forEach(animalName => {
        const animal = animals.find(a => a.name === animalName);
        if (animal && animal.logo) urls.add(animal.logo);
      });
    });
  });
  
  return Array.from(urls).filter(url => url && url.trim());
}

function preloadImages(urls) {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const total = urls.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    urls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === total) resolve();
      };
      img.onerror = () => {
        loaded++;
        console.warn('Не удалось загрузить изображение:', url);
        if (loaded === total) resolve();
      };
      img.src = url;
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader');
  
  try {
    const imageUrls = getAllImageUrls();
    await preloadImages(imageUrls);
  } catch (e) {
    console.error('Ошибка при загрузке изображений:', e);
  } finally {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
      init();
    }, 600);
  }
});