import { defineCard } from "../define.js";

// EDHREC rank 22994. Act of Treason with +2/+0, {3} cheaper against a
// creature token (its mana value stays 4 — the ruling).

export default defineCard({
  name: "Mascot Interception",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "This spell costs {3} less to cast if it targets a creature token.\nGain control of target creature until end of turn. Untap that creature. It gets +2/+0 and gains haste until end of turn.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", token: true }, reduceGeneric: 3 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
    ],
  },
});
