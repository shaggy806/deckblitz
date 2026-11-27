import { defineCard } from "../define.js";

export default defineCard({
  name: "Laquatus's Champion",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 6,
  toughness: 3,
  text: "When this creature enters, target player loses 6 life.\nWhen this creature leaves the battlefield, that player gains 6 life.\n{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 6, target: 0 },
      resolve: null,
      text: "When this creature enters, target player loses 6 life.",
      notesTarget: true,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 6, who: "noted-target-player" },
      resolve: null,
      text: "When this creature leaves the battlefield, that player gains 6 life.",
    },
  ],
});
