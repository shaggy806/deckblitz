import { defineCard } from "../define.js";

// EDHREC rank 23215.
//
// Rulings:
//   [2020-09-25] If a permanent on the battlefield or a card in a graveyard has {X} in its mana
//     cost, X is considered to be 0.
//
// One instruction, so one move (`simultaneous`): the permanents and the
// graveyard cards go to exile as a single event (rule 603.2c — "whenever one
// or more cards are put into exile" fires once).

const SMALL = { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 3 } } as const;

export default defineCard({
  name: "Shadows' Verdict",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile all creatures and planeswalkers with mana value 3 or less from the battlefield and all creature and planeswalker cards with mana value 3 or less from all graveyards.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "exile-all", filter: SMALL },
      { kind: "exile-graveyard", target: "each-player", filter: SMALL },
    ],
  },
});
