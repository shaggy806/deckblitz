import { defineCard } from "../define.js";

// EDHREC rank 5430.
//
// Rulings:
//   [2020-11-10] For the second mode, use the powers of the creature cards as they existed in the
//     graveyard to determine the value of X.
//   [2020-11-10] If an opponent controls more than one creature with the greatest power among
//     creatures they control, they choose which one to sacrifice.
//   [2020-11-10] If both modes are chosen, they happen in the stated order. Any creature cards
//     that end up in an opponent's graveyard because they were sacrificed for the first mode will
//     be exiled as the instructions for the second mode are followed.

export default defineCard({
  name: "Szat's Will",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n" +
    "• Each opponent sacrifices a creature they control with the greatest power.\n" +
    "• Exile all opponents' graveyards, then create X 0/1 black Thrull creature tokens, where X is the greatest power among creature cards exiled this way.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Each opponent sacrifices a creature they control with the greatest power.",
        targets: [],
        effect: {
          kind: "sacrifice",
          who: "each-opponent",
          filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
          count: 1,
        },
      },
      {
        text: "Exile all opponents' graveyards, then create X 0/1 black Thrull creature tokens, where X is the greatest power among creature cards exiled this way.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile-graveyard", target: "each-opponent" },
            {
              kind: "create-token",
              token: "Thrull Token",
              count: { aggregate: "max", of: "power", filter: { type: "creature" }, in: { thisWay: "exiled" } },
            },
          ],
        },
      },
    ],
  },
});
