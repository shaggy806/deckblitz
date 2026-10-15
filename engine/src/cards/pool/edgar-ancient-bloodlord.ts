import { defineCard } from "../define.js";

// EDHREC rank 23347.

const SAC_TEXT =
  "{2}, Sacrifice another creature or planeswalker: Put a +1/+1 counter on Edgar. He gains menace until end of turn.";

export default defineCard({
  name: "Edgar, Ancient Bloodlord",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 2,
  toughness: 3,
  text: "Whenever another creature or planeswalker you control dies, you gain 1 life.\n{2}, Sacrifice another creature or planeswalker: Put a +1/+1 counter on Edgar. He gains menace until end of turn. (He can't be blocked except by two or more creatures.)",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "planeswalker"] } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
      otherOnly: true,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Whenever another creature or planeswalker you control dies, you gain 1 life.",
    },
  ],
});
