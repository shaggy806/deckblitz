import { defineCard } from "../define.js";

const HEROIC =
  "Heroic — Whenever you cast a spell that targets this creature, each opponent sacrifices a creature of their choice.";

export default defineCard({
  name: "Agent of the Fates",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${HEROIC}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: HEROIC,
    },
  ],
});
