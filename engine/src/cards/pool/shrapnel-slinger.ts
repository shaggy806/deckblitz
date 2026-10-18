import { defineCard } from "../define.js";

// EDHREC rank 20776.
//
// Rulings:
//   [2023-02-04] You don't choose a target for Shrapnel Slinger last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you sacrifice a creature this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.

const ETB_TEXT =
  "When this creature enters, you may sacrifice a creature. When you do, destroy target artifact an opponent controls.";

export default defineCard({
  name: "Shrapnel Slinger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      // "A creature" — Shrapnel Slinger itself included (Gastal Blockbuster's shape).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "opponent", filter: { type: "artifact" } }],
          effect: { kind: "destroy", target: 0 },
          text: "When you do, destroy target artifact an opponent controls.",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
