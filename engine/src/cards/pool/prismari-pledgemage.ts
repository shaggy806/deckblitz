import { defineCard } from "../define.js";

// EDHREC rank 27019. Magecraft (a cast or a copy) frees it from defender
// for the turn, Krotiq Nestguard's effect.
const MAGECRAFT_TEXT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, this creature can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Prismari Pledgemage",
  manaCost: "{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${MAGECRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", orCopy: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "attack-despite-defender", target: "source" },
      resolve: null,
      text: MAGECRAFT_TEXT,
    },
  ],
});
