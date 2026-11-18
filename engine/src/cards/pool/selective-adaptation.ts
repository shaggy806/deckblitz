import type { Keyword } from "../define.js";
import { defineCard } from "../define.js";

// Ikoria: Lair of Behemoths (IKO). EDHREC rank 17533.
//
// Rulings:
//   [2020-04-17] If a card has more than one of the listed keywords, you pick which keyword you're
//     choosing it for. For example, if you choose a card with flying and first strike, you may
//     choose it as the card with flying and choose another card with first strike, or you may
//     choose it as the card with first strike and choose another card with flying.
//
// One card a keyword (`together.oneEach`: a card fills any slot it matches, one card a slot), and
// "choose" isn't optional, so `min` is every slot — clamped to the most the revealed cards can
// fill. The first card picked goes onto the battlefield and the other chosen cards into your
// hand (`restDestination`), the rest into your graveyard, all as one move.

const KEYWORDS: readonly [Keyword, string][] = [
  ["flying", "flying"],
  ["first-strike", "first strike"],
  ["double-strike", "double strike"],
  ["deathtouch", "deathtouch"],
  ["haste", "haste"],
  ["hexproof", "hexproof"],
  ["indestructible", "indestructible"],
  ["lifelink", "lifelink"],
  ["menace", "menace"],
  ["reach", "reach"],
  ["trample", "trample"],
  ["vigilance", "vigilance"],
];

export default defineCard({
  name: "Selective Adaptation",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Reveal the top seven cards of your library. Choose from among them a card with flying, a card with first strike, and so on for double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance. Put one of the chosen cards onto the battlefield, the other chosen cards into your hand, and the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    reveal: true,
    min: KEYWORDS.length,
    max: KEYWORDS.length,
    together: {
      oneEach: KEYWORDS.map(([keyword, words]) => ({ label: `a card with ${words}`, filter: { keyword } })),
      text: "a card for each keyword",
    },
    destination: "battlefield",
    restDestination: "hand",
    leftover: "graveyard",
  },
});
