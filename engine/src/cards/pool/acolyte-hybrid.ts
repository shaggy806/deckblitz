import { defineCard } from "../define.js";

// EDHREC rank 15123.
//
// Rulings:
//   [2022-10-07] If the target artifact has indestructible, it isn't destroyed this way and you
//     won't draw a card. If it is destroyed but put into a zone other than a graveyard, you'll
//     draw a card.
//
// "Its controller draws a card" is King Solomon's Frogs' shape: each player
// draws as many as they controlled of the artifacts destroyed this way (as it
// left), so an indestructible or illegal target draws nobody anything.

const CUTTER_TEXT =
  "Heavy Rock Cutter — Whenever this creature attacks, destroy up to one target artifact. If an artifact is destroyed this way, its controller draws a card.";

export default defineCard({
  name: "Acolyte Hybrid",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tyranid", "Human"],
  power: 2,
  toughness: 2,
  text: CUTTER_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "artifact" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "draw", who: "each-player", amount: { thisWay: "destroyed", who: "each" } },
        ],
      },
      resolve: null,
      text: CUTTER_TEXT,
    },
  ],
});
