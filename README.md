# 🏰 Manh's Cozy Corner - Medieval Personal Website

A horizontally scrolling personal website with a cozy medieval campfire aesthetic, built with Next.js and featuring immersive storytelling elements.

## 🌟 Overview

This project is a unique personal portfolio website that breaks away from traditional vertical scrolling. Instead, it presents content as a horizontal journey through different "sections" of a medieval story, complete with atmospheric lighting, interactive elements, and a bottom navigation trail that resembles a wanderer's path.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom medieval theming
- **Icons**: Lucide React
- **Fonts**: EB Garamond (body), Cinzel (headings)
- **Deployment**: Vercel-ready

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── globals.css              # Consolidated styles with medieval theming
│   ├── layout.tsx               # Root layout with font configuration
│   ├── page.tsx                 # Main entry point
│   ├── letter/
│   │   └── page.tsx            # Dedicated letter writing page
│   ├── library/
│   │   ├── page.tsx            # Publications archive page
│   │   └── loading.tsx         # Loading component
│   └── map/
│       └── page.tsx            # Map modal route (shallow routing)
├── components/
│   ├── ScrollContainer.tsx      # Main horizontal scroll orchestrator
│   ├── WandererTrail.tsx       # Bottom navigation trail
│   ├── ScrollArrows.tsx        # Left/right navigation arrows
│   ├── MapModal.tsx            # Travel map modal with animations
│   ├── [Section]Section.tsx    # Individual section components
│   └── ui/                     # Reusable UI components
│       ├── SimpleRectangleButton.tsx  # Minimalist interactive buttons
│       ├── SpellScroll.tsx     # Project showcase cards
│       ├── ScholarScroll.tsx   # Publication display cards
│       ├── TavernTale.tsx      # Blog post cards
│       ├── QuoteScroll.tsx     # Decorative quote displays
│       ├── WoodenMedallion.tsx # Social media links
│       ├── MagicalScroll.tsx   # Animated letter CTA
│       ├── LibraryPortal.tsx   # Archive entrance (deprecated)
│       ├── FeaturedScroll.tsx  # Highlighted publications
│       └── ScrollModal.tsx     # Publication detail modal
└── utils/
    ├── constants.ts            # Re-export hub for backward compatibility
    ├── content.ts              # Publications, projects, blog posts data
    ├── sections.ts             # Section definitions and timeline
    ├── travel.ts               # Travel journey data for map
    └── handlers.ts             # Navigation and event handling logic
\`\`\`

## 🎨 Design System

### Theme Concept
The website embodies a **"cozy medieval campfire"** aesthetic, where users feel like they're sitting by a warm fire under a starlit sky, listening to stories and exploring ancient scrolls.

### Color Palette
- **Background**: Deep dark blue night sky (#0a0a1a to #1a1a45) with scattered white stars
- **Primary**: Warm amber/orange tones (#f97316, #ea580c)
- **Wood**: Rich brown gradients (#8b4513, #654321, #a0522d)
- **Parchment**: Cream/beige tones (#f5e6d3, #faf7f0)
- **Accent**: Golden highlights (#ffd700, #daa520)

### Typography
- **Headings**: Cinzel (medieval serif)
- **Body**: EB Garamond (elegant serif)
- **Style**: Italics used extensively for storytelling feel

### Visual Elements
- **Parchment Textures**: Multiple gradient overlays for aged paper effect
- **Wooden Frames**: Border gradients with shadow effects
- **Ember Glows**: Radial gradients with box-shadow animations
- **Flickering Flames**: CSS animations for dynamic lighting
- **Star Field**: Multiple radial gradients for scattered stars

## 🧭 Navigation System

### Horizontal Scrolling
- **Method**: CSS `scroll-snap-type: x mandatory`
- **Sections**: 8 total sections with smooth transitions
- **Controls**: Mouse wheel, keyboard arrows, navigation trail, side arrows

### Wanderer Trail (Bottom Navigation)
- **Design**: Transparent overlay with dotted path line
- **Markers**: Circular buttons with fantasy icons
- **Active State**: Enlarged with ember glow effect
- **Tooltips**: Hover descriptions for each section
- **Safe Area**: CSS custom properties prevent content overlap

### Keyboard Shortcuts
- **Arrow Keys**: Navigate between sections/map years
- **Escape**: Close modals
- **Wheel/Scroll**: Horizontal navigation (preventDefault applied)

## 📱 Responsive Design

### Safe Area System
\`\`\`css
:root {
  --nav-trail-height: 80px;
  --nav-trail-bottom-offset: 60px;
  --nav-trail-safe-margin: 40px;
  --nav-safe-area: calc(var(--nav-trail-height) + var(--nav-trail-bottom-offset) + var(--nav-trail-safe-margin));
}
\`\`\`

### Breakpoints
- **Desktop**: Full experience with all animations
- **Tablet** (≤768px): Reduced navigation trail size
- **Mobile** (≤480px): Optimized spacing and touch targets

## 🎭 Sections Overview

### 1. Hero Section (`HeroSection.tsx`)
- **Purpose**: Welcome and introduction
- **Features**: Animated flame, call-to-action buttons
- **Content**: Personal greeting and site overview

### 2. About Section (`AboutSection.tsx`)
- **Purpose**: Personal story and timeline
- **Features**: Portrait frame, parchment background, timeline events
- **Content**: Biography and career milestones

### 3. Map Section (`MapSection.tsx`)
- **Purpose**: Travel experiences showcase
- **Features**: Simple rectangle button → opens modal
- **Modal**: Full-screen travel journey with years navigation

### 4. Projects Section (`ProjectsSection.tsx`)
- **Purpose**: Portfolio showcase
- **Features**: SpellScroll cards with tech "runes"
- **Content**: Project descriptions, tech stacks, links

### 5. Publications Section (`PublicationsSection.tsx`)
- **Purpose**: Academic/research work
- **Features**: Featured scrolls + archive button
- **Modal**: Detailed publication viewer
- **Archive**: Dedicated page with search/filter

### 6. Blog Section (`BlogSection.tsx`)
- **Purpose**: Personal writing and thoughts
- **Features**: TavernTale cards with excerpts
- **Content**: Blog posts with medieval styling

### 7. Letter Section (`LetterSection.tsx`)
- **Purpose**: Contact form
- **Features**: Simple rectangle button → dedicated page
- **Page**: Full writing desk experience with form

### 8. Socials Section (`SocialsSection.tsx`)
- **Purpose**: Social media and connections
- **Features**: WoodenMedallion buttons, closing quote
- **Content**: Social links with carved wood aesthetic

## 🔧 Key Components

### ScrollContainer (`ScrollContainer.tsx`)
**Purpose**: Main orchestrator for horizontal scrolling experience
**Features**:
- Manages scroll state and navigation
- Handles keyboard/wheel events
- Coordinates with navigation components
- Prevents scroll bleeding between sections

### WandererTrail (`WandererTrail.tsx`)
**Purpose**: Bottom navigation with fantasy theming
**Features**:
- 8 section markers with custom icons
- Dotted path SVG connecting markers
- Hover tooltips with section descriptions
- Active state management with glow effects

### SimpleRectangleButton (`SimpleRectangleButton.tsx`)
**Purpose**: Minimalist interactive elements
**Features**:
- Three themed hover effects (ember, scholar, magic)
- Thin vertical, long horizontal proportions
- Scale and glow animations
- No text labels for clean aesthetic

### MapModal (`MapModal.tsx`)
**Purpose**: Immersive travel story viewer
**Features**:
- Scroll unfurling animation
- Keyboard navigation (arrows, escape)
- Wheel scroll support within modal
- Year-by-year journey progression
- Coordinate-based location markers

## 📊 Content Management

### Data Structure
Content is separated into focused utility files:

**`content.ts`**: Publications, projects, blog posts
**`travel.ts`**: Journey data with coordinates and memories  
**`sections.ts`**: Section definitions and timeline events

### Content Types
\`\`\`typescript
interface Publication {
  title: string
  journal: string
  year: string
  abstract?: string
  link?: string
}

interface Project {
  title: string
  description: string
  tech: string[]
  github: string
  demo: string
}

interface TravelYear {
  year: string
  location: string
  title: string
  memory: string
  mood: string
  coordinates: { top: string; left: string }
}
\`\`\`

## 🎨 Styling Architecture

### CSS Organization
All styles consolidated in `globals.css` for reliable loading:

1. **Tailwind Base**: Core framework styles
2. **Navigation Safe Area**: Custom properties system
3. **Forest Campfire Background**: Star field and gradients
4. **Lighting Effects**: Glow and ember animations
5. **Medieval Elements**: Buttons, parchment, wood textures
6. **Component Styles**: Specific component styling
7. **Responsive**: Mobile-first breakpoints

### Custom CSS Classes
- `.forest-campfire`: Main background with stars
- `.firelight`: Warm lighting overlay
- `.ember-glow`: Orange glow effect
- `.parchment`: Aged paper texture
- `.medieval-button`: Wooden button styling
- `.wanderer-trail-*`: Navigation trail components

## 🚀 Development Workflow

### Getting Started
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Key Development Notes

1. **Font Loading**: Fonts are configured in `layout.tsx` with CSS variables
2. **Modal Routing**: Uses Next.js shallow routing for map modal
3. **Event Handling**: Centralized in `utils/handlers.ts`
4. **Scroll Prevention**: Careful management to prevent scroll bleeding
5. **Safe Areas**: CSS custom properties ensure content doesn't overlap navigation

### Adding New Sections
1. Create section component in `components/`
2. Add section data to `utils/sections.ts`
3. Import and add to `ScrollContainer.tsx`
4. Add icon and description to `WandererTrail.tsx`
5. Update navigation handlers if needed

### Adding New Content
1. **Projects**: Add to `utils/content.ts` projects array
2. **Publications**: Add to `utils/content.ts` publications array
3. **Blog Posts**: Add to `utils/content.ts` blogPosts array
4. **Travel**: Add to `utils/travel.ts` travelYears array

## 🎯 Performance Considerations

### Optimizations
- **Image Placeholders**: SVG placeholders for development
- **Lazy Loading**: Components load as needed
- **CSS Consolidation**: Single CSS file reduces requests
- **Font Display**: `swap` strategy for font loading
- **Smooth Scrolling**: Hardware-accelerated CSS transforms

### Bundle Size
- **Lucide Icons**: Tree-shaken, only used icons included
- **Tailwind**: Purged unused styles in production
- **TypeScript**: Compiled away in production

## 🔒 Accessibility

### Features
- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labeling for interactive elements
- **Screen Reader**: Semantic HTML structure
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Sufficient contrast ratios maintained

### Testing
- Test with keyboard-only navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test on various devices and browsers

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Mobile Horizontal Scroll**: Some mobile browsers may have scroll behavior quirks
2. **Animation Performance**: Complex animations may impact older devices
3. **Content Loading**: Large images should be optimized for production

### Future Enhancements
- [ ] Add sound effects for interactions
- [ ] Implement progressive image loading
- [ ] Add more interactive animations
- [ ] Create admin panel for content management
- [ ] Add blog post creation workflow

## 📝 Contributing

### Code Style
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier configuration
- **Components**: Functional components with hooks
- **Props**: Interface definitions for all props
- **Naming**: Descriptive, medieval-themed where appropriate

### Git Workflow
1. Create feature branch from main
2. Implement changes with descriptive commits
3. Test across different devices/browsers
4. Submit pull request with detailed description

## 📄 License

This project is a personal portfolio website. Please respect the creative work and ask permission before using significant portions of the code or design.

## 🙏 Acknowledgments

- **Design Inspiration**: Medieval manuscripts and cozy campfire aesthetics
- **Technical Foundation**: Next.js and Tailwind CSS communities
- **Typography**: Google Fonts (EB Garamond, Cinzel)
- **Icons**: Lucide React icon library

---

*"In the quiet hours of night, by firelight and thought, stories come alive in the digital realm."*
