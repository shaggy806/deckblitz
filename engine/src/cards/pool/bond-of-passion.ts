import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 23945.
//
// Act of Treason, then 2 damage to any other target. Each half is done
// whatever became of the other target (its rulings — rule 608.2b).

export default defineCard({
  name: "Bond of Passion",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. Bond of Passion deals 2 damage to any other target.",
  targets: ["creature", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
