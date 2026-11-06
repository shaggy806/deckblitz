import { defineCard } from "../define.js";

// EDHREC rank 27903.

const SEEK_TEXT = "Seek out — Whenever you draw your second card each turn, Ro Laren deals 2 damage to each opponent.";
const LOOT_TEXT = "{1}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Ro Laren, Double Agent",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bajoran", "Rogue", "Officer"],
  power: 3,
  toughness: 2,
  text: `${SEEK_TEXT}\n${LOOT_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
