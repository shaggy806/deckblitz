import { defineCard } from "../define.js";

// EDHREC rank 17070.
//
// Rulings:
//   [2024-09-20] If you somehow control Phenomenon Investigators and no choice was made for it
//     (perhaps because another permanent on the battlefield became a copy of it, or it was
//     manifested and later turned face up), it has neither of the two triggered abilities.
//
// A Siege's shape: each ability is gated on the word named as it entered,
// and with no word named neither is there. "Doubt" is a choice as it
// resolves, not a target: any nonland permanent you own, whoever controls
// it, and "if you do" is whether one was returned.
const BELIEVE = "Believe — Whenever a nontoken creature you control dies, create a 2/2 black Horror enchantment creature token.";
const DOUBT =
  "Doubt — At the beginning of your end step, you may return a nonland permanent you own to your hand. If you do, draw a card.";

export default defineCard({
  name: "Phenomenon Investigators",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 4,
  text: `As this creature enters, choose Believe or Doubt.\n• ${BELIEVE}\n• ${DOUBT}`,
  chooseOnEnter: ["Believe", "Doubt"],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
      condition: { kind: "chosen-on-enter", value: "Believe" },
      targets: [],
      effect: { kind: "create-token", token: "Horror Token", count: 1 },
      resolve: null,
      text: BELIEVE,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "chosen-on-enter", value: "Doubt" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { notTypes: ["land"], ownedBy: "you" },
            min: 0,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "You may return a nonland permanent you own to your hand",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DOUBT,
    },
  ],
});
