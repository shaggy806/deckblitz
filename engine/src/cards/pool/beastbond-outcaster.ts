import { defineCard } from "../define.js";

// EDHREC rank 18603. An intervening "if" (rule 603.4): checked as it
// triggers and again as it resolves (the ruling) — Garruk's Uprising's shape.
// It counts itself, which can't have power 4 without help.
const ENTER_TEXT = "When this creature enters, if you control a creature with power 4 or greater, draw a card.";

export default defineCard({
  name: "Beastbond Outcaster",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 3,
  plot: { cost: "{1}{G}" },
  text: `${ENTER_TEXT}\nPlot {1}{G} (You may pay {1}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
