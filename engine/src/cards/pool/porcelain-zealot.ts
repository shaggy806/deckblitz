import { defineCard } from "../define.js";

// EDHREC rank 19229.

export default defineCard({
  name: "Porcelain Zealot",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 2,
  toughness: 3,
  text: "At the beginning of combat on your turn, target creature you control gets +1/+1 until end of turn. If that creature has toxic, instead it gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      // Toxic read as it resolves.
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { hasToxic: true } },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target creature you control gets +1/+1 until end of turn. If that creature has toxic, instead it gets +2/+2 until end of turn.",
    },
  ],
});
