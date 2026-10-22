import { defineCard } from "../define.js";

// EDHREC rank 29962.

export default defineCard({
  name: "Ornery Kudu",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Antelope"],
  power: 3,
  toughness: 4,
  text: "When this creature enters, put a -1/-1 counter on target creature you control.",
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
