import { defineCard } from "../define.js";

// EDHREC rank 21242.
//
// "You may exile a card from your graveyard. If you do" is Trystan, Penitent
// Culler's shape: a choice of none or one, and the 2 damage only if one was
// exiled. The creature is still there to have a controller (state-based
// actions wait for the spell to finish). An illegal target stops the whole
// spell, the exile with it (the ruling).
const TEXT =
  "Heated Argument deals 6 damage to target creature. You may exile a card from your graveyard. If you do, Heated Argument also deals 2 damage to that creature's controller.";

export default defineCard({
  name: "Heated Argument",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "look-and-choose", zone: "graveyard", min: 0, max: 1, destination: "exile", leftover: "stay" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "exiled" },
        then: { kind: "damage", amount: 2, toControllerOfTarget: 0 },
      },
    ],
  },
});
