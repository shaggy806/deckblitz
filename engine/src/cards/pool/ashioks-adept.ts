import { defineCard } from "../define.js";

// EDHREC rank 24334. Heroic is Brigone, Soldier of Meletis's cast trigger.
const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, each opponent discards a card.";

export default defineCard({
  name: "Ashiok's Adept",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
