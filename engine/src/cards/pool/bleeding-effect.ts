import type { Keyword } from "../define.js";
import type { EffectSpec } from "../../effects.js";
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
// Odric, Lunarch Marshal's shape, each keyword's condition read off the
// creature cards in your graveyard as the trigger resolves, and
// `grant-keyword-all` fixing the creatures then (rule 611.2c). The engine has
// no keyword variants (no "hexproof from"), so the first ruling has nothing to
// distinguish.

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

const gainIfInGraveyard = (keyword: Keyword): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature", keyword } },
  then: { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword, duration: "end-of-turn" },
});

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
      effect: { kind: "sequence", effects: KEYWORDS.map(gainIfInGraveyard) },
      resolve: null,
      text: TEXT,
    },
  ],
});
