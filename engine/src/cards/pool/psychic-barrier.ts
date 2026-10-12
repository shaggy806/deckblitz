import { defineCard } from "../define.js";

export default defineCard({
  name: "Psychic Barrier",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. Its controller loses 1 life.",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "counter", target: 0 }, { kind: "lose-life", amount: 1, toControllerOfTarget: 0 }],
  },
});
