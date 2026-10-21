import { defineCard } from "../define.js";

// EDHREC rank 7696.
// Makes Spirit → use "Spirit Token (White-Black)".
//
// Rulings:
//   [2019-06-14] As the first mode is performed, first the opponent whose turn it is (or, if it’s
//     not an opponent’s turn, the next opponent in turn order) chooses a creature they control,
//     then each other opponent in turn order does the same, knowing the choices made before them.
//     Then all the chosen creatures are sacrificed at the same time.
//   [2019-06-14] If Kaya’s Guile isn’t entwined, you must choose two different modes.
//   [2019-06-14] Each chosen mode is performed in the order specified. Abilities that trigger
//     while one mode is being performed won’t be put onto the stack until Kaya’s Guile has
//     finished resolving.
//   [2019-06-14] A creature sacrificed for the first mode of Kaya’s Guile will be exiled if it
//     ends up in an opponent’s graveyard and the second mode was also chosen.

export default defineCard({
  name: "Kaya's Guile",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "entwine" },
  text: "Choose two —\n• Each opponent sacrifices a creature of their choice.\n• Exile all opponents' graveyards.\n• Create a 1/1 white and black Spirit creature token with flying.\n• You gain 4 life.\nEntwine {3} (Choose all if you pay the entwine cost.)",
  castModal: {
    minModes: 2,
    maxModes: 2,
    kickedModes: 4,
    modes: [
      {
        text: "Each opponent sacrifices a creature of their choice.",
        effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      },
      { text: "Exile all opponents' graveyards.", effect: { kind: "exile-graveyard", target: "each-opponent" } },
      {
        text: "Create a 1/1 white and black Spirit creature token with flying.",
        effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: 1 },
      },
      { text: "You gain 4 life.", effect: { kind: "gain-life", amount: 4 } },
    ],
  },
});
