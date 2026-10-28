import { defineCard } from "../define.js";

// World (rule 704.5k): the world rule is the engine's, keyed on the supertype.
export default defineCard({
  name: "Concordant Crossroads",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "All creatures have haste.",
  static: [
    {
      affects: { scope: "all-creatures" },
      grantKeywords: ["haste"],
      text: "All creatures have haste.",
    },
  ],
});
