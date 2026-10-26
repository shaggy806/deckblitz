import { defineCard } from "../define.js";

// EDHREC rank 23036.
//
// With no card returned (an illegal graveyard target) no damage is dealt (the
// ruling), so the damage waits on the return — Foul Renewal's shape.

export default defineCard({
  name: "Morgue Burst",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to your hand. Morgue Burst deals damage to any target equal to the power of the card returned this way.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, "any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "returned-to-hand" },
        then: { kind: "damage", amount: { powerOf: 0 }, target: 1 },
      },
    ],
  },
});
