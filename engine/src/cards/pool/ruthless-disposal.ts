import { defineCard } from "../define.js";

// EDHREC rank 25618.
//
// Exactly two different targets (the rulings), chosen before the costs are
// paid — so one may be the creature then sacrificed, and the other still gets
// -13/-13.

export default defineCard({
  name: "Ruthless Disposal",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, discard a card and sacrifice a creature.\nTwo target creatures each get -13/-13 until end of turn.",
  additionalCost: { discard: 1, sacrifice: { type: "creature" } },
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: -13, toughness: -13, duration: "end-of-turn" },
    ],
  },
});
