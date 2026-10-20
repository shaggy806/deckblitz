import { defineCard } from "../define.js";

// EDHREC rank 18711. The batched graveyard trigger: several cards leaving at
// once trigger it once (the ruling).
const TEXT = "Whenever one or more cards leave your graveyard, this creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Fuming Effigy",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
