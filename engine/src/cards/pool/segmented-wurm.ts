import { defineCard } from "../define.js";

export default defineCard({
  name: "Segmented Wurm",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  text: "Whenever this creature becomes the target of a spell or ability, put a -1/-1 counter on it.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "Whenever this creature becomes the target of a spell or ability, put a -1/-1 counter on it.",
    },
  ],
});
