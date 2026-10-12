import { defineCard } from "../define.js";

export default defineCard({
  name: "Reckless Pangolin",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Pangolin"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, it gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/+1 until end of turn.",
    },
  ],
});
