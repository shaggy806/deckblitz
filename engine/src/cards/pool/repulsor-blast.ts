import { defineCard } from "../define.js";

// EDHREC rank 19781.
//
// Cast using teamwork is the kicked cast (rule 702.194): its `effect` adds the
// 2 damage to the creature's controller, read after the 5 damage (the
// creature is still on the battlefield then; state-based actions wait).
const DAMAGE = { kind: "damage", amount: 5, target: 0 } as const;

export default defineCard({
  name: "Repulsor Blast",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 2,
    effect: {
      kind: "sequence",
      effects: [DAMAGE, { kind: "damage", amount: 2, toControllerOfTarget: 0 }],
    },
  },
  text:
    "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\n" +
    "Repulsor Blast deals 5 damage to target creature. If this spell was cast using teamwork, it also deals 2 damage to that creature's controller.",
  targets: ["creature"],
  effect: DAMAGE,
});
