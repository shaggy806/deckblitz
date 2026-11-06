import { defineCard } from "../define.js";

// EDHREC rank 31052.

const PT_TEXT =
  "Strange new worlds — Lt. Arex's power and toughness are each equal to the number of differently named lands " +
  "you control.";
const ENTER_TEXT =
  "When Lt. Arex enters, draw three cards. You may put up to three land cards from your hand onto the battlefield " +
  "tapped.";

export default defineCard({
  name: "Lt. Arex, Ever-Adapting",
  manaCost: "{5}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Edosian", "Officer"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 3,
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
