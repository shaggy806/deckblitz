import { defineCard } from "../define.js";

// EDHREC rank 21876.

export default defineCard({
  name: "Fight with Fire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {5}{R} (You may pay an additional {5}{R} as you cast this spell.)\nFight with Fire deals 5 damage to target creature. If this spell was kicked, it deals 10 damage divided as you choose among any number of targets instead. (Those targets can include players and planeswalkers.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
  // The division is of the kicked spell's "any number of targets" group
  // (slot 0 of `kicker.targets`), announced as it's cast (rule 601.2d); the
  // unkicked spell's one creature target ignores it.
  divided: { total: 10, slot: 0 },
  kicker: {
    cost: "{5}{R}",
    targets: [{ kind: "any-number", of: "any-target", max: 10 }],
    effect: { kind: "damage-divided", from: 0 },
  },
});
