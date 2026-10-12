import { defineCard } from "../define.js";

export default defineCard({
  name: "Kiln Walker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 0,
  toughness: 3,
  text: "Whenever this creature attacks, it gets +3/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +3/+0 until end of turn.",
    },
  ],
});
