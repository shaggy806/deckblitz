import { defineCard } from "../define.js";

export default defineCard({
  name: "Bramble Creeper",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 3,
  text: "Whenever this creature attacks, it gets +5/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 5, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +5/+0 until end of turn.",
    },
  ],
});
