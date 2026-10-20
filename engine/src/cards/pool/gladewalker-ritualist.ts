import { defineCard } from "../define.js";

export default defineCard({
  name: "Gladewalker Ritualist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling"],
  text: "Changeling (This card is every creature type.)\nWhenever another creature you control named Gladewalker Ritualist enters, draw a card.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", name: "Gladewalker Ritualist" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever another creature you control named Gladewalker Ritualist enters, draw a card.",
    },
  ],
});
