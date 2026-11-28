import { defineCard } from "../define.js";

// The rhystic question turned round: each player in turn order from the active
// player may pay {2}, the next asked only once the one before declines (rule
// 101.4, `unless` of `"any-player"`), and it's paying that makes the caster
// discard (the option's `ifPaid`, nothing otherwise). The payer's effect, so
// the discard names the spell's controller (`{ controllerOf: "source" }`).

const TEXT = "Draw three cards. Then if any player pays {2}, discard three cards.";

export default defineCard({
  name: "Rhystic Scrying",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      {
        kind: "unless",
        chooser: "any-player",
        options: [
          {
            pay: "{2}",
            text: "Pay {2}",
            ifPaid: { kind: "discard", target: { controllerOf: "source" }, amount: 3 },
          },
        ],
        otherwise: { kind: "sequence", effects: [] },
      },
    ],
  },
});
