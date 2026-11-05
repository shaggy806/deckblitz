import { defineCard } from "../define.js";

// EDHREC rank 18630.

const TEXT =
  "Whenever you cast a noncreature spell, you may pay {1}. When you do, target creature with haste can't be blocked this turn except by creatures with haste.";

export default defineCard({
  name: "Speed, Young Avenger",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", filter: { type: "creature", keyword: "haste" } }],
          effect: { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { notKeyword: "haste" } },
          text: "Target creature with haste can't be blocked this turn except by creatures with haste.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
