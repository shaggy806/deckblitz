import { defineCard } from "../define.js";

export default defineCard({
  name: "Soul Scourge",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target player loses 3 life.\nWhen this creature leaves the battlefield, that player gains 3 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "lose-life", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature enters, target player loses 3 life.",
      notesTarget: true,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3, who: "noted-target-player" },
      resolve: null,
      text: "When this creature leaves the battlefield, that player gains 3 life.",
    },
  ],
});
