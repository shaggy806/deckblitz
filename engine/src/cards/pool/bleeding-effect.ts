import type { Keyword } from "../define.js";
import { defineCard } from "../define.js";

// EDHREC rank 9539.
//
// Rulings:
//   [2024-07-05] If one of the creature cards in your graveyard has one or more variants of the
//     listed keywords (for example, hexproof from white), creatures you control gain those
//     specific variants.
//   [2024-07-05] The set of creatures affected by Bleeding Effect's ability and how they are
//     affected is determined as the ability resolves. Creatures you begin to control later in the
//     turn won't gain any abilities, and the abilities gained won't change if creature cards enter
//     or leave your graveyard after the ability has resolved.
// Odric, Lunarch Marshal's shape: a `become` whose `sharesKeywords` reads the
// creature cards in your graveyard once as the trigger resolves
// (`inGraveyard`) and gives what they have to the creatures you control then
// (rule 611.2c), one effect and one timestamp. A "hexproof from [quality]"
// there is shared as itself (702.11d-e, the first ruling).

const TEXT =
  "At the beginning of combat on your turn, creatures you control gain flying until end of turn if a creature card in your graveyard has flying. The same is true for first strike, double strike, deathtouch, hexproof, indestructible, lifelink, menace, reach, trample, and vigilance.";

const KEYWORDS: readonly Keyword[] = [
  "flying",
  "first-strike",
  "double-strike",
  "deathtouch",
  "hexproof",
  "indestructible",
  "lifelink",
  "menace",
  "reach",
  "trample",
  "vigilance",
];

export default defineCard({
  name: "Bleeding Effect",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "become",
        filter: { type: "creature", controlledBy: "you" },
        duration: "end-of-turn",
        sharesKeywords: { from: { type: "creature" }, inGraveyard: true, keywords: KEYWORDS },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
