import { defineCard } from "../define.js";

// EDHREC rank 18214.

const TEXT = "Whenever another blue creature you control enters, target player mills two cards.";

export default defineCard({
  name: "Sage's Row Denizen",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", colors: ["U"] }, otherOnly: true },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
