// Common explicit words detected in music lyrics.
// Uses a Set for O(1) lookup. Detection normalizes to lowercase and strips punctuation.
export const EXPLICIT_WORDS = new Set([
  // F-word
  'fuck', 'fuckin', 'fucking', 'fucked', 'fucker', 'fuckers', 'fucks',
  'motherfuck', 'motherfucker', 'motherfucking', 'motherfuckers', 'mfer',
  // S-word
  'shit', 'shitting', 'shits', 'shitty', 'bullshit',
  // B-words
  'bitch', 'bitches', 'bitching', 'bitchin',
  // A-words
  'ass', 'asses', 'asshole', 'assholes', 'dumbass', 'jackass', 'badass',
  // D-words
  'damn', 'dammit', 'goddamn', 'goddammit', 'goddamned',
  // Body-part slang used as insults
  'dick', 'dicks', 'cock', 'cocks', 'pussy', 'pussies',
  // Slurs
  'nigga', 'niggas', 'nigger', 'niggers',
  'faggot', 'faggots', 'fag',
  // Other
  'cunt', 'cunts',
  'whore', 'whores',
  'slut', 'sluts',
  'bastard', 'bastards',
  'piss', 'pissed',
  'hell',
  'crap',
  'wtf',
])

export function containsExplicit(transcript) {
  const words = transcript.toLowerCase().split(/\s+/)
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '')
    if (clean && EXPLICIT_WORDS.has(clean)) {
      return clean
    }
  }
  return null
}
