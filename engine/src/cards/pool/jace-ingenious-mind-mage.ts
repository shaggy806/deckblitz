import { defineCard } from "../define.js";

// EDHREC rank 12519.
//
// Rulings: the −9's control change lasts indefinitely — not until cleanup,
// nor until Jace leaves.

export default defineCard({
  name: "Jace, Ingenious Mind-Mage",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 5,
  text: "+1: Draw a card.\n+1: Untap all creatures you control.\n−9: Gain control of up to three target creatures.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "+1: Draw a card.",
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      resolve: null,
      text: "+1: Untap all creatures you control.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          { kind: "gain-control", target: 1, untilEndOfTurn: false },
          { kind: "gain-control", target: 2, untilEndOfTurn: false },
        ],
      },
      resolve: null,
      text: "−9: Gain control of up to three target creatures.",
    },
  ],
});
