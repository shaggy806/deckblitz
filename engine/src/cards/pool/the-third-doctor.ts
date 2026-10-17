import { defineCard } from "../define.js";

// EDHREC rank 9782.
//
// "Noncreature token" counts every token you control that isn't a creature as
// the layer fold runs — a Clue, Food or Treasure, and a token that stops being
// a creature too.
const PT_TEXT = "The Third Doctor gets +1/+1 for each noncreature token you control.";
const ENTERS_TEXT =
  "When The Third Doctor enters, create your choice of a Clue token, a Food token, or a Treasure token.";

export default defineCard({
  name: "The Third Doctor",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { token: true, notTypes: ["creature"], controlledBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a Clue token.", effect: { kind: "create-token", token: "Clue Token", count: 1 } },
          { text: "Create a Food token.", effect: { kind: "create-token", token: "Food Token", count: 1 } },
          { text: "Create a Treasure token.", effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
