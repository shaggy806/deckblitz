import { defineCard } from "../define.js";

// EDHREC rank 14325.

const MILL_TEXT = "Whenever another creature or planeswalker you control enters, mill two cards.";
const EXHAUST_TEXT =
  "Exhaust — {5}{B}: Return target creature or planeswalker card from your graveyard to the battlefield. " +
  "Put a +1/+1 counter on Liliana. Activate only as a sorcery. (Activate each exhaust ability only once.)";

export default defineCard({
  name: "Liliana the Repentant",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  text: `${MILL_TEXT}\n${EXHAUST_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
      sorcerySpeed: true,
    },
  ],
});
