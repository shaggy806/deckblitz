import { defineCard } from "../define.js";

// EDHREC rank 11197. Agent of Horizons' unblockability and Wharf Infiltrator's
// optional loot.

const LOOT_TEXT = "Whenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Daring Saboteur",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  text: `{2}{U}: This creature can't be blocked this turn.\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{2}{U}: This creature can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
