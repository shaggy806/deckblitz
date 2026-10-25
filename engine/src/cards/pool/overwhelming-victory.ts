import { defineCard } from "../define.js";

// X is the excess damage (rule 120.4a — damage already marked counts) the
// 5 damage dealt to the target, read once as the pump applies; the trample
// and the pump reach the creatures you control as it resolves.
export default defineCard({
  name: "Overwhelming Victory",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text: "Overwhelming Victory deals 5 damage to target creature. Each creature you control gains trample and gets +X/+0 until end of turn, where X is the amount of excess damage dealt this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { excessDamageThisWay: true, to: 0 },
        toughness: 0,
        duration: "end-of-turn",
      },
    ],
  },
});
