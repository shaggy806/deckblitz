import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Rulings:
//   [2016-01-22] No player may take any actions between the two times the player goes through the
//     process.
//   [2016-01-22] The player can't choose to discard two cards unless they have at least two cards
//     in hand. Similarly, that player can't choose to sacrifice a creature or planeswalker unless
//     they control one. This means that if the target opponent doesn't have two cards in hand and
//     doesn't control a creature or planeswalker, that player will lose 5 life and then lose 5
//     life again.
//   [2016-04-08] The same player chooses both times.

const PROCESS: EffectSpec = {
  kind: "unless",
  chooser: 0,
  options: [
    { discard: 2, text: "Discard two cards" },
    { sacrifice: { typesAnyOf: ["creature", "planeswalker"] }, text: "Sacrifice a creature or planeswalker" },
  ],
  otherwise: { kind: "lose-life", amount: 5, target: 0 },
};

export default defineCard({
  name: "Remorseless Punishment",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent loses 5 life unless that player discards two cards or sacrifices a creature or planeswalker of their choice. Repeat this process once.",
  targets: ["opponent"],
  effect: { kind: "sequence", effects: [PROCESS, PROCESS] },
});
