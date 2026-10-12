import { defineCard } from "../define.js";

export default defineCard({
  name: "Fortress Cyclops",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Soldier"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature attacks, it gets +3/+0 until end of turn.\nWhenever this creature blocks, it gets +0/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +3/+0 until end of turn.",
    },
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature blocks, it gets +0/+3 until end of turn.",
    },
  ],
});
