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
      description: 'I was born in Tehran as the youngest member of a five-person family. Economically, we were upper middle class. The period in which I was born belonged to a generation that experienced a sudden leap in computer technologies, unfolding in parallel with our childhood. Fortunately, my family kept up to date with technology, and I also started working with it and became interested in it.',
      media: singleMedia
    },
    {
      id: 'early-tech-passion',
      year: '2015.1',
      title: 'Innate Passion for Tech',
      type: 'major',
      description: 'I spent countless hours independently exploring the digital world, naturally gravitating towards **software development** and learning the fundamentals of `C++` and `Java`.',
      media: singleMedia
    },
    {
      id: 'practical-programming',
      year: '2016.1',
      title: 'Coding for Convenience',
      type: 'minor',
      description: 'Programming became a tool for convenience, automation, and pure fun for me. My early coding experience was far more than a Hello World. For example, instead of manually calculating my school exam percentages and scores on paper like everyone else, I wrote a Java program to do it for me.',
      media: singleMedia
    },
    {
      id: 'childhood-storyteller',
      year: '2017.1',
      title: 'The Storyteller',
      type: 'major',
      description: 'It all started with storytelling. I had a strong passion for writing serialized stories. Deep world-building and a distinct sense of humor were the two key elements that kept my classmates engaged week after week.',
      media: singleMedia
    },
    {
      id: 'first-story-published',
      year: '2017.2',
      title: 'The Serialized Troublemaker',
      type: 'minor',
      description: 'One of the serialized stories I wrote for composition class won a school competition and earned my teacher’s recommendations. However, the jokes and humor I used made me incredibly popular among my peers while simultaneously infuriating the teachers.',
      media: singleMedia
    },
    {
      id: 'cinema-visual-arts',
      year: '2018.1',
      title: 'Exploring Visual Arts',
      type: 'major',
      description: 'Seeking new ways to express ideas, I shifted my focus to cinema. I spent time studying art history, film directing, and the core fundamentals of the medium to understand visual storytelling better.',
      media: singleMedia
    },
    {
      id: 'animation-era',
      year: '2019.10',
      title: 'The Animation Era',
      type: 'major',
      description: 'Faced with the practical limitations of filmmaking, I transitioned to 3D Animation. I learned extensively from reliable sources like Digital Creator School videos, and consistently analyzed the production pipelines of major projects and reputable studios to understand industry-standard workflows.',
      media: albumMedia
    },
    {
      id: 'personal-3d-art',
      year: '2020.2',
      title: '3D as a Playground',
      type: 'minor',
      description: 'Before doing professional work, 3D was my playground. I used it to design my own custom desktop wallpapers and create funny, cool renders just to entertain my friends.',
      media: singleMedia
    },
    {
      id: 'freelance-3d-rendering',
      year: '2020.10',
      title: 'Little Work',
      type: 'minor',
      description: 'Eventually, I took my 3D skills into the semi-professional realm. I successfully delivered architectural rendering projects and even designed and rendered promotional materials for a speaker brand.',
      media: albumMedia
    },
    {
      id: 'first-ue-experience',
      year: '2021.4',
      title: 'First Encounter with Unreal Engine',
      type: 'major',
      description: 'Shortly before university, I started experimenting with `Unreal Engine 4.27`. I focused on **level design** and basic animations, though I intentionally avoided logic and `Blueprints` at the time, finding the coding aspect intimidating.',
      media: albumMedia
    },
    {
      id: 'university-engineering',
      year: '2022.7',
      title: 'Embracing the Code & University',
      type: 'major',
      description: 'Entering university as a Computer Engineering major at K. N. Toosi University of Technology bridged my artistic and technical sides. I didn’t just build functional academic projects; I focused heavily on non-functional requirements and extra polish. Because I always over-delivered, my peers constantly wanted to team up with me. Additionally, my strong academic performance led to me serving as a Teaching Assistant (TA) twice.',
      media: singleMedia
    },
    {
      id: 'uni-project-1',
      year: '2023.1',
      title: 'Advanced Snake & Ladder',
      type: 'minor',
      description: 'In this game, nothing had a fixed position—snakes, blocks, ladders, and various types of snakes were all dynamic. The game’s dice also had its own specific complexities. The main focus of the project was managing a **fair randomization structure** alongside `error handling` and resolving numerical collisions within the board matrix.',
      media: albumMedia
    },
    {
      id: 'uni-project-2',
      year: '2023.2',
      title: 'Algorithm GUI',
      type: 'minor',
      description: 'This was a well-known project aimed at graphically demonstrating the behavior of recursive algorithms. My chosen algorithm was the Koch Snowflake, implemented with a time complexity of 𝑂(log4𝑛).',
      media: albumMedia
    },
    {
      id: 'uni-project-3',
      year: '2023.3',
      title: 'GameStore Back-End',
      type: 'minor',
      description: 'For this project, students were tasked with developing their own custom game store. The main challenge was implementing a massive set of features, including a storefront, a friend system, donations, a messaging system, trading mechanics, multiple access levels, data management, and basic data encryption.',
      media: albumMedia
    },
    {
      id: 'uni-project-4',
      year: '2023.4',
      title: 'CyberTank 2077',
      type: 'minor',
      description: 'We were assigned to recreate the classic ‘Battle City’ game using the `JavaFX` library. Excited, I asked my professor if I could use a game engine like `Unreal Engine`, but he refused, stating the tools must be the same for everyone. After realizing `JavaFX` could somewhat handle 3D, I decided to build a **3D game anyway—without any game engine**. Interestingly, once I later familiarized myself with Unreal Engine’s source code, I realized how close my custom implementations were to real-world engine architectures, including leveling systems, loading mechanisms, I/O management, the `Game Loop`, and core `OOP` concepts. (More details: https://drive.google.com/file/d/1k882IGtzAkO6ZSqfkKVw221slod445pG/view?usp=drive_link)',
      media: albumMedia
    },
    {
      id: 'Additional-Project-1',
      year: '2023.11',
      title: 'Aysooda',
      type: 'minor',
      description: 'As I mentioned earlier, my interest in coding was never purely academic; it was always a tool for convenience and fun. Alongside university assignments, I developed personal projects like **Aysooda**. This was a customized Windows task management and planning application built using `WinUI 3`, Microsoft’s newest and most beautiful UI framework at the time.',
      media: albumMedia
    },
    {
      id: 'industry-internship',
      year: '2025.2',
      title: 'Stepping into the Industry',
      type: 'major',
      description: 'I officially stepped into the industry by joining a startup studio backed by Behsazan Holding (belonging to Bank Mellat, one of the country’s largest banks). Here, I worked on metaverse environments, VR simulations, and AI avatar platforms.',
      media: albumMedia
    },
    {
      id: 'cross-team-challenges',
      year: '2025.8',
      title: 'Bridging Art and Hardware',
      type: 'minor',
      description: 'My role required me to navigate challenging meetings with both the art and investment teams. We tackled complex issues, from designing the architecture for avatar animations to balancing strict hardware budgets while pushing for the highest possible visual quality.',
      media: singleMedia
    },
    {
      id: 'pixel-streaming-solution',
      year: '2025.10',
      title: 'The Pixel Streaming Paradigm',
      type: 'minor',
      description: 'To bypass hardware limitations for end-users, I worked on a **Pixel Streaming** system. This allowed users to experience our high-end `Unreal Engine` applications using the company’s servers, requiring zero hardware investment on their end.',
      media: singleMedia
    },
    {
      id: 'technical-director',
      year: '2026.1',
      title: 'Towards Leading the Tech',
      type: 'major',
      description: 'Following my internship, I rapidly grew within the studio, taking on increasingly complex challenges. I eventually stepped into the role of Technical Director, overseeing engine architecture and project integration while collaborating with specialized AI backend and UX teams.',
      media: singleMedia
    }
  ]
}
