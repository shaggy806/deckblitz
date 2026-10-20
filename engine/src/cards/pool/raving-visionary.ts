import { defineCard } from "../define.js";

const LOOT = "{U}, {T}: Draw a card, then discard a card.";
const DELIRIUM =
  "Delirium — {2}{U}, {T}: Draw a card. Activate only if there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Raving Visionary",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${LOOT}\n${DELIRIUM}`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
    {
      cost: { mana: "{2}{U}", tap: true },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DELIRIUM,
    },
  ],
});
