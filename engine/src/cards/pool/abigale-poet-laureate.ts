import { defineCard } from "../define.js";

export default defineCard({
  name: "Abigale, Poet Laureate",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Bard"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever you cast a creature spell, Abigale becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: "Whenever you cast a creature spell, Abigale becomes prepared.",
    },
  ],
  prepareSpell: "Heroic Stanza",
});
