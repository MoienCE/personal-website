const onMountImage = new URL('../../assets/OnMount.jpg', import.meta.url).href
const meImage = new URL('../../assets/Me.jpg', import.meta.url).href

const singleMedia = {
  type: 'single',
  items: [onMountImage]
}

const albumMedia = {
  type: 'album',
  items: [onMountImage, meImage]
}

// Timeline data - add/edit milestones here
// Use "YYYY.M" or "YYYY.MM" to place items inside the same year by month.
export const timelineData = {
  startYear: 2000,
  activeOffset: 0.5,
  pointGap: 280,
  minPointGap: 220,
  maxPointGap: 440,
  minScrollVh: 180,
  milestones: [
    {
      id: 'born',
      year: '2003.11',
      title: 'Born',
      type: 'major',
      description: 'Raised in Tehran within a well-resourced, tech-forward environment during the rapid evolution of computer technologies, which fostered a lasting passion and foundational aptitude for the **tech industry**.',
      media: singleMedia
    },
    {
      id: 'early-tech-passion',
      year: '2015.1',
      title: 'Innate Passion for Tech',
      type: 'major',
      description: 'Spent extensive time independently exploring the digital world, naturally gravitating toward **software development** and learning the fundamentals of `C++` and `Java`.',
      media: singleMedia
    },
    {
      id: 'practical-programming',
      year: '2016.1',
      title: 'Coding for Convenience',
      type: 'minor',
      description: 'Leveraged early programming skills for practical automation and problem-solving, progressing beyond basic exercises to independently develop a custom `Java` tool for calculating academic grades.',
      media: singleMedia
    },
    {
      id: 'childhood-storyteller',
      year: '2017.1',
      title: 'The Storyteller',
      type: 'major',
      description: 'Maintained a strong interest in writing serialized stories, with a focus on deep **world-building** and a distinct **sense of humor** that consistently engaged classmates.',
      media: singleMedia
    },
    {
      id: 'first-story-published',
      year: '2017.2',
      title: 'The Serialized Troublemaker',
      type: 'minor',
      description: 'One serialized story written for a composition class won a school competition and received teacher recommendations. Its humor significantly increased peer engagement while also drawing mixed reactions from teachers.',
      media: singleMedia
    },
    {
      id: 'cinema-visual-arts',
      year: '2018.1',
      title: 'Exploring Visual Arts',
      type: 'major',
      description: 'Shifted focus to cinema as a medium for expression, studying **art history**, **film directing**, and core fundamentals to better understand **visual storytelling**.',
      media: singleMedia
    },
    {
      id: 'animation-era',
      year: '2019.10',
      title: 'The Animation Era',
      type: 'major',
      description: 'Transitioned to `3D Animation`, learning extensively from structured educational sources such as Digital Creator School and analyzing **production pipelines** of major projects and established studios to understand **industry-standard workflows**.',
      media: albumMedia
    },
    {
      id: 'personal-3d-art',
      year: '2020.2',
      title: '3D as a Playground',
      type: 'minor',
      description: 'Used `3D` as a creative playground prior to professional work, designing custom desktop wallpapers and producing informal renders for personal use and peer entertainment.',
      media: singleMedia
    },
    {
      id: 'freelance-3d-rendering',
      year: '2020.10',
      title: 'Little Work',
      type: 'minor',
      description: 'Transitioned into semi-professional work by delivering **architectural rendering** projects and designing and rendering promotional materials for a speaker brand.',
      media: albumMedia
    },
    {
      id: 'first-ue-experience',
      year: '2021.4',
      title: 'First Encounter with UE',
      type: 'major',
      description: 'Began experimenting with `Unreal Engine 4.27` prior to university, focusing on **level design** and basic animations, while intentionally avoiding `Blueprints` due to initial hesitation toward the coding aspects.',
      media: albumMedia
    },
    {
      id: 'university-engineering',
      year: '2022.7',
      title: 'Embracing the Code & University',
      type: 'major',
      description: 'Bridged technical and artistic disciplines during a `Computer Engineering` degree at **K. N. Toosi University of Technology**. Consistently delivered highly polished academic projects exceeding baseline requirements, built strong collaborative demand among peers, and earned two Teaching Assistant appointments.',
      media: singleMedia
    },
    {
      id: 'uni-project-1',
      year: '2023.1',
      title: 'Advanced Snake & Ladder',
      type: 'minor',
      description: 'Developed a version of Snake & Ladder where no elements had fixed positions—snakes, blocks, ladders, and variations of snakes were all dynamic. The dice system also included specific complexities, with a primary focus on implementing a **fair randomization structure**, robust `error handling`, and resolving numerical collisions within the board matrix.',
      media: albumMedia
    },
    {
      id: 'uni-project-2',
      year: '2023.2',
      title: 'Algorithm GUI',
      type: 'minor',
      description: 'Implemented a graphical demonstration of **recursive algorithms**, selecting the Koch Snowflake and achieving a time complexity of 𝑂(log4n).',
      media: albumMedia
    },
    {
      id: 'uni-project-3',
      year: '2023.3',
      title: 'GameStore Back-End',
      type: 'minor',
      description: 'Developed a custom game store system with an extensive feature set, including **storefront functionality**, **friend systems**, donations, a messaging system, **trading mechanics**, multiple access levels, **data management**, and basic **data encryption**.',
      media: albumMedia
    },
    {
      id: 'uni-project-4',
      year: '2023.4',
      title: 'CyberTank 2077',
      type: 'minor',
      description: 'Recreated the classic “Battle City” game using the `JavaFX` library. Despite tool constraints, developed a `3D` game without a game engine. Later comparison my game with UE source code revealed close alignment with real-world engine architectures, including `leveling systems`, `loading mechanisms`, `I/O management`, the `Game Loop`, and core `OOP` concepts. ',
      media: albumMedia
    },
    {
      id: 'Additional-Project-1',
      year: '2023.11',
      title: 'Aysooda',
      type: 'minor',
      description: 'Developed a personal project, **Aysooda**, as a customized Windows task management and planning application using `WinUI 3` & `C#`, Microsoft’s modern UI framework at the time.',
      media: albumMedia
    },
    {
      id: 'industry-internship',
      year: '2025.2',
      title: 'Stepping into the Industry',
      type: 'major',
      description: 'Entered the industry by joining a startup studio backed by Behsazan Holding (affiliated with Bank Mellat), contributing to metaverse environments, VR simulations, and AI avatar platforms.',
      media: albumMedia
    },
    {
      id: 'cross-team-challenges',
      year: '2025.8',
      title: 'Bridging Art and Hardware',
      type: 'minor',
      description: 'Participated in cross-functional discussions with art and investment teams, addressing complex challenges such as **avatar animation architecture** and balancing strict hardware budgets with **visual quality** targets.',
      media: singleMedia
    },
    {
      id: 'pixel-streaming-solution',
      year: '2025.10',
      title: 'The Pixel Streaming Paradigm',
      type: 'minor',
      description: 'Developed a **Pixel Streaming** solution to overcome end-user hardware limitations, enabling access to high-end `Unreal Engine` applications through company-hosted servers without requiring local hardware investment.',
      media: singleMedia
    },
    {
      id: 'technical-director',
      year: '2026.1',
      title: 'Towards Leading the Tech',
      type: 'minor',
      description: 'Following the internship, progressed into increasingly complex responsibilities and ultimately assumed the role of **Technical Director**, overseeing **engine architecture**, **project integration**, and collaboration with **AI backend** and **UX** teams.',
      media: singleMedia
    }
  ]

}
