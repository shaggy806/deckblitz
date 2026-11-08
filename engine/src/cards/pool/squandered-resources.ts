import { defineCard } from "../define.js";

const TEXT = "Sacrifice a land: Add one mana of any type the sacrificed land could produce.";

// EDHREC rank 5393. A mana ability (rule 605.1a) activated by hand: the land is
// chosen with the colour, and what it could produce is read just before the
// cost takes it (rule 106.7), so a land that could produce nothing makes
// nothing (the ruling).
export default defineCard({
  name: "Squandered Resources",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "add-mana", mana: { sacrificedCouldProduce: { type: "land" } }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
