import { defineCard } from "../define.js";

// Rulings:
//   The mana value of a double-faced card in your graveyard is always the mana value of the front
//     face.
//   The mana value of a land card is 0.
//   The mana value of a split card in the graveyard is the total mana value of both halves of that
//     card. It does not have two mana values.
//   X is 0 when determining the mana value of a card in your graveyard.

const LOOT_TEXT = "Whenever this creature enters or attacks, draw two cards, then discard a card.";
const DISCARD_TEXT =
  "Whenever you discard a card, target creature an opponent controls gets -X/-0 until your next turn, where X is the number of different mana values among cards in your graveyard.";

export default defineCard({
  name: "All-Seeing Arbiter",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LOOT_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" }, -1] },
        toughness: 0,
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
