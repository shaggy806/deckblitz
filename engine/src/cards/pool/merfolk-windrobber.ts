import { defineCard } from "../define.js";

const HIT_TEXT = "Whenever this creature deals combat damage to a player, that player mills a card.";
const SAC_TEXT =
  "Sacrifice this creature: Draw a card. Activate only if an opponent has eight or more cards in their graveyard.";

export default defineCard({
  name: "Merfolk Windrobber",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${HIT_TEXT} (They put the top card of their library into their graveyard.)\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "cards-in-graveyard", whose: "an-opponent", atLeast: 8 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 1 },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
