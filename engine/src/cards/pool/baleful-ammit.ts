import { defineCard } from "../define.js";

// EDHREC rank 20083.

export default defineCard({
  name: "Baleful Ammit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Crocodile", "Demon"],
  power: 4,
  toughness: 3,
  keywords: ["lifelink"],
  text: "Lifelink\nWhen this creature enters, put a -1/-1 counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a -1/-1 counter on target creature you control.",
    },
  ],
});
