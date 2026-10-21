import { defineCard } from "../define.js";

// Act of Treason plus "add two mana of any one color" (Gilded Lotus's shape).
// An illegal target by resolution means the spell doesn't resolve: no mana
// either (its ruling — rule 608.2b).
export default defineCard({
  name: "Traitorous Greed",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. Add two mana of any one color. (The creature can attack and {T} this turn.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "add-mana", mana: "any-color", amount: 2 },
    ],
  },
});
