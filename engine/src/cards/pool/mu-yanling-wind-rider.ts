import { defineCard } from "../define.js";

// EDHREC rank 7187.

const ETB_TEXT = "When Mu Yanling enters, create a 3/2 colorless Vehicle artifact token with crew 1.";
const FLYING_TEXT = "Vehicles you control have flying.";
const DRAW_TEXT = "Whenever one or more creatures you control with flying deal combat damage to a player, draw a card.";

export default defineCard({
  name: "Mu Yanling, Wind Rider",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Pilot"],
  power: 2,
  toughness: 4,
  text: `${ETB_TEXT}\n${FLYING_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vehicle", controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Vehicle Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      // Batched: once per player dealt combat damage by any of them.
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", keyword: "flying" },
        combat: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
