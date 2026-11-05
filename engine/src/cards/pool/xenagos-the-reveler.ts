import { defineCard } from "../define.js";

// EDHREC rank 5085. The +1 uses the stack, and the mix is chosen as it resolves
// (the ruling).
const PLUS_TEXT = "+1: Add X mana in any combination of {R} and/or {G}, where X is the number of creatures you control.";
const ZERO_TEXT = "0: Create a 2/2 red and green Satyr creature token with haste.";
const ULT_TEXT =
  "−6: Exile the top seven cards of your library. You may put any number of creature and/or land cards from among them onto the battlefield.";

export default defineCard({
  name: "Xenagos, the Reveler",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Xenagos"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${ZERO_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: { countOf: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Red Green Satyr Token (Haste)", count: 1 },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 7 },
          {
            kind: "look-and-choose",
            zone: "exile",
            min: 0,
            max: 7,
            filter: { thisWay: "exiled", typesAnyOf: ["creature", "land"] },
            destination: "battlefield",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
