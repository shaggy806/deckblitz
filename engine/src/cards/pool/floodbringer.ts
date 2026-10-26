import { defineCard } from "../define.js";

const TEXT = "{2}, Return a land you control to its owner's hand: Tap target land.";

export default defineCard({
  name: "Floodbringer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["land"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
