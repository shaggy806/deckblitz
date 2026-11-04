import { defineCard } from "../define.js";

// New Capenna Commander.
//
// The copies are one instruction, so they enter together, each opponent's own,
// goaded by this creature's controller (rule 701.15). A copy has this text too,
// so "if it's not a token" is what stops the tokens making more.
const ATTACKS_TEXT = "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of creatures you control.";
const ENTERS_TEXT =
  "When this creature enters, if it's not a token, each opponent creates a token that's a copy of it. The tokens are goaded for the rest of the game.";

export default defineCard({
  name: "Life of the Party",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  keywords: ["first-strike", "trample", "haste"],
  text: `First strike, trample, haste\n${ATTACKS_TEXT}\n${ENTERS_TEXT} (They attack each combat if able and attack a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "creature", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { token: false } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        simultaneous: true,
        effect: { kind: "create-token-copy", of: "source", count: 1, who: "that-player", goadedForGame: true },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
