import { defineCard } from "../define.js";

export default defineCard({
  name: "Chorus of the Tides",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nHeroic — Whenever you cast a spell that targets this creature, scry 1. (To scry 1, look at the top card of your library, then you may put that card on the bottom.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, scry 1.",
    },
  ],
});
