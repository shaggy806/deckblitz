import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When The Cyber-Controller enters, each opponent mills X cards. Put all creature cards milled this way onto the battlefield face down under your control. They're 2/2 Cyberman artifact creatures.";
const LORD_TEXT = "Other artifact creatures you control get +1/+1.";

export default defineCard({
  name: "The Cyber-Controller",
  manaCost: "{X}{U}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Cyberman"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${LORD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-opponent", amount: "x" },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 999,
            max: 999,
            filter: { type: "creature", thisWay: "milled" },
            destination: "battlefield",
            under: "you",
            enterAs: { faceDown: "2/2 Cyberman artifact creature" },
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
});
