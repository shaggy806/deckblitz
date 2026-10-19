import { defineCard } from "../define.js";

// EDHREC rank 9724.
//
// Rulings:
//   [2022-10-14] The ability of that Construct token does count the Construct itself, so it'll
//     be at least 1/1.
//
// Modes are chosen as it's cast (`castModal`) and happen in printed order. The
// -2/-0 is Beyeen Veil's: the creatures there as it resolves (rule 611.2c).
// The Construct is Urza's Saga's ("Construct Token", which counts itself —
// the ruling), and the Powerstone the BRO token, both entering tapped.

const SHRINK = "Creatures you don't control get -2/-0 until end of turn.";
const POWERSTONE = "Create a tapped Powerstone token.";
const CONSTRUCT =
  'Create a tapped 0/0 colorless Construct artifact creature token with "This token gets +1/+1 for each artifact you control."';
const DRAW = "Scry 1, then draw a card.";

export default defineCard({
  name: "Urza's Command",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose two —\n• ${SHRINK}\n• ${POWERSTONE}\n• ${CONSTRUCT}\n• ${DRAW}`,
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: SHRINK,
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "opponent" },
          power: -2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      { text: POWERSTONE, effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true } },
      { text: CONSTRUCT, effect: { kind: "create-token", token: "Construct Token", count: 1, tapped: true } },
      { text: DRAW, effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } } },
    ],
  },
});
