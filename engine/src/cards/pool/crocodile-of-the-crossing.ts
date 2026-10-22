import { defineCard } from "../define.js";

// EDHREC rank 26262.

export default defineCard({
  name: "Crocodile of the Crossing",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, put a -1/-1 counter on target creature you control.",
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
