const portraitImage = new URL('../../assets/OnMount.jpg', import.meta.url).href

// Edit content here first. The renderer, navigation, and observers stay data-driven.
export const siteConfig = {
  hero: {
    name: 'Moien34',
    eyebrow: '',
    portrait: {
      src: portraitImage,
      alt: 'Moien standing on a mountain'
    },
    traits: ['A developer', 'Interested in the world', 'Sensitive to beauty'],
    tips: [
      'Scroll and enjoy <3',
      'Use Up/Down keys to navigate.',
      'Press Space to move to the next section.'
    ]
  },
  sections: [
    {
      id: 'timeline',
      title: 'Timeline',
      icon: '◎',
      summary: 'Life events and milestones will live here as a data-driven timeline.'
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: '◧',
      summary: 'Selected work, experiments, and technical notes can be added here.'
    },
    {
      id: 'about',
      title: 'About',
      icon: '◉',
      summary: 'A focused story about personality, interests, and working style.'
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: '✦',
      summary: 'Links and contact options can be wired into this section later.'
    }
  ]
}
