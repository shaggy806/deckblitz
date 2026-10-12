import { defineCard } from "../define.js";

export default defineCard({
  name: "Hollow Dogs",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Dog"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature attacks, it gets +2/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +2/+0 until end of turn.",
    },
  ],
});
