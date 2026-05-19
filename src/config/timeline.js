const onMountImage = new URL('../../assets/OnMount.jpg', import.meta.url).href
const meImage = new URL('../../assets/Me.jpg', import.meta.url).href

// Timeline data - add/edit milestones here
export const timelineData = {
  startYear: 2000,
  activeOffset: 0.5,
  pointGap: 280,
  minScrollVh: 180,
  milestones: [
    {
      id: 'birth',
      year: 2003,
      title: 'Born',
      type: 'major',
      description: 'I was born in Tehran as the youngest member of a five‑person family. Economically, we were upper middle class. The period in which I was born belonged to a generation that experienced a sudden leap in computer technologies, unfolding in parallel with our childhood. Fortunately, my family kept up to date with technology, and I also started working with it and became interested in it.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    },
    {
      id: 'school-start',
      year: 2006,
      title: 'School Years',
      type: 'major',
      description: 'Started my educational journey.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    },
    {
      id: 'elementary',
      year: 2008,
      title: null,
      type: 'minor',
      description: 'Elementary school period - learning the basics.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    },
    {
      id: 'middle-school',
      year: 2012,
      title: null,
      type: 'minor',
      description: 'Middle school years - discovering new interests.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    },
    {
      id: 'high-school',
      year: 2015,
      title: 'High School',
      type: 'major',
      description: 'High school era - preparing for the future.',
      media: {
        type: 'album',
        items: [onMountImage, meImage]
      }
    },
    {
      id: 'university',
      year: 2018,
      title: 'University',
      type: 'major',
      description: 'Started university studies in computer science.',
      media: {
        type: 'single',
        items: [meImage]
      }
    },
    {
      id: 'first-project',
      year: 2020,
      title: null,
      type: 'minor',
      description: 'Launched my first major personal project.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    },
    {
      id: 'graduation',
      year: 2022,
      title: 'Graduation',
      type: 'major',
      description: 'Graduated with honors and started professional career.',
      media: {
        type: 'album',
        items: [meImage, onMountImage]
      }
    },
    {
      id: 'present',
      year: 2024,
      title: 'Present',
      type: 'major',
      description: 'Currently working on exciting projects and learning new technologies.',
      media: {
        type: 'single',
        items: [onMountImage]
      }
    }
  ]
}
