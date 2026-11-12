import { defineCard } from "../define.js";

// EDHREC rank 11519.

const LEAVE_TEXT =
  "Whenever another nontoken creature you control leaves the battlefield, put a +1/+1 counter on Tokka & Rahzar and create a Treasure token. This ability triggers only once each turn.";

export default defineCard({
  name: "Tokka & Rahzar, Unsupervised",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Turtle", "Wolf", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", token: false },
        otherOnly: true,
      },
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "create-token", token: "Treasure Token", count: 1 },
        ],
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
