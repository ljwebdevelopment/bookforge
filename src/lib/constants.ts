export const PROJECT_TEMPLATES = [
  {
    id: 'memoir',
    label: 'Memoir',
    description: 'Personal narrative and life experiences',
    icon: '📖',
    defaultTarget: 80000,
    defaultGuidelines: `Write in first person throughout.
Maintain emotional authenticity and vulnerability.
Ground abstract experiences in specific sensory details.
Avoid summarizing—show scenes as they happened.
Maintain a consistent reflective voice that balances past and present perspective.
Do not explain emotions; instead, demonstrate them through action and dialogue.`,
  },
  {
    id: 'book',
    label: 'Book',
    description: 'General book or long-form project',
    icon: '📚',
    defaultTarget: 80000,
    defaultGuidelines: `Maintain consistent voice and tone throughout.
Support all major claims with evidence or examples.
Ensure smooth transitions between chapters and sections.
Avoid repetition of key ideas across chapters.`,
  },
  {
    id: 'nonfiction',
    label: 'Nonfiction',
    description: 'Research-based or informational writing',
    icon: '🔬',
    defaultTarget: 60000,
    defaultGuidelines: `Ground every argument in verifiable facts or expert sources.
Maintain an authoritative but accessible tone.
Anticipate and address counterarguments.
Use concrete examples to illustrate abstract concepts.`,
  },
  {
    id: 'novel',
    label: 'Novel',
    description: 'Fiction and narrative storytelling',
    icon: '✍️',
    defaultTarget: 90000,
    defaultGuidelines: `Show character through action and dialogue, not description.
Maintain consistent point of view.
Every scene should advance plot, reveal character, or both.
Vary sentence length and rhythm to control pacing.`,
  },
  {
    id: 'article',
    label: 'Article',
    description: 'Journalism, essays, opinion pieces',
    icon: '📰',
    defaultTarget: 2000,
    defaultGuidelines: `Lead with the most important information.
Be direct—state the thesis clearly in the opening paragraph.
Use specific, concrete details rather than generalizations.
Maintain journalistic objectivity while making the argument clear.`,
  },
  {
    id: 'research-paper',
    label: 'Research Paper',
    description: 'Academic or investigative research',
    icon: '🎓',
    defaultTarget: 10000,
    defaultGuidelines: `State the research question clearly in the introduction.
Follow proper citation format consistently.
Acknowledge limitations of the research.
Use precise, discipline-appropriate terminology.`,
  },
  {
    id: 'speech',
    label: 'Speech',
    description: 'Spoken word, addresses, presentations',
    icon: '🎤',
    defaultTarget: 3000,
    defaultGuidelines: `Write for the ear, not the eye—use short sentences and clear rhythm.
Repeat key phrases for emphasis and memorability.
Build toward a clear, memorable conclusion.
Include deliberate pauses and transitions for delivery.`,
  },
  {
    id: 'song',
    label: 'Song',
    description: 'Lyrics and songwriting',
    icon: '🎵',
    defaultTarget: 500,
    defaultGuidelines: `Every line should serve the song's emotional core.
Prioritize sound—rhythm, rhyme, and phonetic texture.
Avoid clichés; find fresh images for familiar emotions.
The hook should be instantly memorable.`,
  },
  {
    id: 'blank',
    label: 'Blank',
    description: 'Start from scratch',
    icon: '📄',
    defaultTarget: 50000,
    defaultGuidelines: '',
  },
] as const

export const GENRES = [
  'Memoir', 'Biography', 'Autobiography',
  'Literary Fiction', 'Commercial Fiction', 'Mystery', 'Thriller', 'Romance',
  'Science Fiction', 'Fantasy', 'Historical Fiction',
  'Narrative Nonfiction', 'Self-Help', 'Business', 'Politics',
  'History', 'Science', 'Philosophy', 'Religion/Spirituality',
  'Journalism', 'Essay', 'Opinion', 'Cultural Criticism',
  'Academic', 'Research', 'Technical',
  'Poetry', 'Songwriting', 'Speeches',
  'Other',
]

export const KNOWLEDGE_BASE_TYPES = [
  { id: 'person', label: 'People', icon: '👤' },
  { id: 'place', label: 'Places', icon: '📍' },
  { id: 'event', label: 'Events', icon: '📅' },
  { id: 'organization', label: 'Organizations', icon: '🏛️' },
  { id: 'argument', label: 'Arguments', icon: '💡' },
  { id: 'quote', label: 'Quotes', icon: '💬' },
  { id: 'theme', label: 'Themes', icon: '🎯' },
  { id: 'other', label: 'Other', icon: '📌' },
]

export const WORKSPACE_NAV_ITEMS = [
  { id: 'manuscript', label: 'Manuscript', icon: 'FileText', href: 'manuscript' },
  { id: 'outline', label: 'Outline', icon: 'List', href: 'outline' },
  { id: 'notes', label: 'Notes', icon: 'StickyNote', href: 'notes' },
  { id: 'research', label: 'Research', icon: 'Search', href: 'research' },
  { id: 'timeline', label: 'Timeline', icon: 'Clock', href: 'timeline' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: 'BookOpen', href: 'knowledge-base' },
  { id: 'guidelines', label: 'Writing Guidelines', icon: 'ScrollText', href: 'guidelines' },
  { id: 'ai-suggestions', label: 'AI Suggestions', icon: 'Sparkles', href: 'ai-suggestions' },
  { id: 'human-pass', label: 'Human Pass', icon: 'UserCheck', href: 'human-pass' },
  { id: 'versions', label: 'Version History', icon: 'History', href: 'versions' },
  { id: 'settings', label: 'Settings', icon: 'Settings', href: 'settings' },
] as const

export const DEFAULT_AI_MODEL = 'claude-sonnet-4-6'
export const AUTOSAVE_DELAY_MS = 2000
export const VERSION_SNAPSHOT_INTERVAL_MS = 15 * 60 * 1000
export const VERSION_SNAPSHOT_WORD_THRESHOLD = 1000

export const GUIDELINES_TOKEN_BUDGET = 1000
export const MEMORY_TOKEN_BUDGET = 2000
export const MANUSCRIPT_TOKEN_BUDGET = 3000
