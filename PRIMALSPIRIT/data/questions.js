const questions = [
  {
    id: 'activity',
    text: 'Когда твоя душа пробуждается?',
    options: [{ value: 'Днём', icon: '/PRIMALSPIRIT/images/test/sun.webp' }, { value: 'Ночью', icon: '/PRIMALSPIRIT/images/test/moon.webp' }],
    weight: 2
  },
  {
    id: 'territoriality',
    text: 'Где ты обретаешь покой: в уюте очага или в странствиях?',
    options: [{ value: 'Дома', icon: '/PRIMALSPIRIT/images/test/home.webp' }, { value: 'Путешествуя', icon: '/PRIMALSPIRIT/images/test/camping.webp' }],
    weight: 2
  },
  {
    id: 'sociality',
    text: 'Чей путь тебе ближе: одинокого волка или в стае?',
    options: [{ value: 'Я одиночка', icon: '/PRIMALSPIRIT/images/test/alone.webp' }, { value: 'Мне нужна семья', icon: '/PRIMALSPIRIT/images/test/family.webp' }],
    weight: 2
  },
  {
    id: 'nutrition',
    text: 'Что питает твой дух: сила первобытного зверя или сладость запретных плодов?',
    options: [{ value: 'Стэйк', icon: '/PRIMALSPIRIT/images/test/meat.webp' }, { value: 'Чизкейк', icon: '/PRIMALSPIRIT/images/test/cheesecake.webp' }],
    weight: 1
  },
  {
    id: 'strategy',
    text: 'Когда тьма сгущается, ты бросаешься в бой или укрываешься за щитом?',
    options: [{ value: 'Атакую', icon: '/PRIMALSPIRIT/images/test/attack.webp' }, { value: 'Обороняюсь', icon: '/PRIMALSPIRIT/images/test/def.webp' }],
    weight: 1
  },
  {
    id: 'mobility',
    text: 'Твой дух стремится к движению или покою?',
    options: [{ value: 'Только вперёд', icon: '/PRIMALSPIRIT/images/test/active.webp' }, { value: 'Лучше помедитирую', icon: '/PRIMALSPIRIT/images/test/passive.webp' }],
    weight: 1
  },
  {
    id: 'appearance',
    text: 'Ты стремишься сиять, или растворяться в тенях?',
    options: [{ value: 'Предпочитаю закулисье', icon: '/PRIMALSPIRIT/images/test/sneak.webp' }, { value: 'Я блистаю на сцене', icon: '/PRIMALSPIRIT/images/test/bright.webp' }],
    weight: 2
  },
  {
    id: 'creativity',
    text: 'Какой путь ты выбираешь, чтобы раскрыть свой внутренний огонь?',
    options: [{ value: 'Следую зову вдохновения', icon: '/PRIMALSPIRIT/images/test/creative.webp' }, { value: 'Полагаюсь на логику и порядок', icon: '/PRIMALSPIRIT/images/test/engeener.webp' }],
    weight: 1
  },
  {
    id: 'foundation',
    text: 'Что правит твоей судьбой: мощь тела или разума?',
    options: [{ value: 'Сила', icon: '/PRIMALSPIRIT/images/test/power.webp' }, { value: 'Интеллект', icon: '/PRIMALSPIRIT/images/test/mind.webp' }],
    weight: 2
  },
  {
    id: 'sensory_organ',
    text: 'Какой дар восприятия открывает тебе тайны мира?',
    options: [
      { value: 'Обонять', icon: '/PRIMALSPIRIT/images/test/nose.webp' },
      { value: 'Видеть', icon: '/PRIMALSPIRIT/images/test/eyes.webp' },
      { value: 'Слышать', icon: '/PRIMALSPIRIT/images/test/ear.webp' }
    ],
    weight: 1
  },
  {
    id: 'climate_zone',
    text: 'В какой обители природы твоя душа чувствует себя дома?',
    options: [
      { value: 'Посвежее', icon: '/PRIMALSPIRIT/images/test/pine.webp' },
      { value: 'Всего в меру', icon: '/PRIMALSPIRIT/images/test/tree.webp' },
      { value: 'Потеплее', icon: '/PRIMALSPIRIT/images/test/palm.webp' }
    ],
    weight: 1
  },
  {
    id: 'element',
    text: 'Выбери свою стихию',
    options: [
      { value: 'ОГОНЬ', icon: '/PRIMALSPIRIT/images/test/fire.webp' },
      { value: 'ВОДА', icon: '/PRIMALSPIRIT/images/test/water.webp' },
      { value: 'ВОЗДУХ', icon: '/PRIMALSPIRIT/images/test/air.webp' },
      { value: 'ЗЕМЛЯ', icon: '/PRIMALSPIRIT/images/test/earth.webp' }
    ],
    weight: 0
  }
];