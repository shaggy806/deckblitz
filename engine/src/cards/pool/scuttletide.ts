import { defineCard } from "../define.js";

const CRAB_TEXT = "{1}, Discard a card: Create a 0/3 blue Crab creature token.";
const DELIRIUM_TEXT =
  "Delirium — Crabs you control get +1/+1 as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Scuttletide",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${CRAB_TEXT}\n${DELIRIUM_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Crab Token", count: 1 },
      resolve: null,
      text: CRAB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Crab", controlledBy: "you" } },
      condition: { kind: "delirium" },
      grantPt: [1, 1],
      text: DELIRIUM_TEXT,
    },
  ],
});
