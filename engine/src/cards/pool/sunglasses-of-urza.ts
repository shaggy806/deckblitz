import { defineCard } from "../define.js";

const TEXT = "You may spend white mana as though it were red mana.";

export default defineCard({
  name: "Sunglasses of Urza",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: { unit: "W", as: "R" } },
      text: TEXT,
    },
  ],
});
