import { defineCard } from "../define.js";

// EDHREC rank 18444.
//
// "If a creature entered the battlefield under your control this turn" is
// Iron Man, Master of Machines' `turn-history` condition, read as the spell
// resolves. An illegal target fizzles the whole spell, so no card is drawn
// (rule 608.2b — the ruling).

export default defineCard({
  name: "Thoughtweft Charge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn. If a creature entered the battlefield under your control this turn, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "turn-history", what: "entered", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
