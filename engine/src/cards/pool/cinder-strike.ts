import { defineCard } from "../define.js";

// EDHREC rank 17121.
//
// "You may blight 1" is an optional additional cost — Burning Curiosity's
// kicker by another name: the kicked cast is the one that blights (offered
// only with a creature to blight, rule 701.68b), and "if this spell's
// additional cost was paid" is the kicked effect.
export default defineCard({
  name: "Cinder Strike",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may blight 1. (You may put a -1/-1 counter on a creature you control.)\nCinder Strike deals 2 damage to target creature. It deals 4 damage to that creature instead if this spell's additional cost was paid.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 2, target: 0 },
  kicker: {
    cost: "",
    keyword: "blight",
    blight: 1,
    effect: { kind: "damage", amount: 4, target: 0 },
  },
});
