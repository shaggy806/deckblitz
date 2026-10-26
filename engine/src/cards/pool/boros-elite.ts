import { defineCard } from "../define.js";

export default defineCard({
  name: "Boros Elite",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Battalion — Whenever this creature and at least two other creatures attack, this creature gets +2/+2 until end of turn.",
    },
  ],
});
