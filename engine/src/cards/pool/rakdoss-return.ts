import { defineCard } from "../define.js";

// EDHREC rank 14356.
//
// The discard reads the target, not the damage: it happens even if the damage is
// prevented or redirected (the ruling). `controllerOfTarget` of a player is that
// player, of a planeswalker its controller.
export default defineCard({
  name: "Rakdos's Return",
  manaCost: "{X}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Rakdos's Return deals X damage to target opponent or planeswalker. That player or that planeswalker's controller discards X cards.",
  targets: ["opponent-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "discard", target: { controllerOfTarget: 0 }, amount: "x" },
    ],
  },
});
