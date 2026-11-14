import { defineCard } from "../define.js";

// The craft trigger goes on the stack above the craft ability that exiled it,
// so the life and the card come before the crafted card returns (the
// ruling); a mana ability's cost paid for that craft counts too.

const DIES_TEXT = "When this creature dies, you gain 1 life and draw a card.";
const CRAFT_TEXT =
  "When this creature is exiled from the battlefield while you're activating a craft ability, you gain 1 life and draw a card.";

export default defineCard({
  name: "Market Gnome",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 0,
  toughness: 3,
  text: `${DIES_TEXT}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["exile"], whileActivatingCraft: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: CRAFT_TEXT,
    },
  ],
});
