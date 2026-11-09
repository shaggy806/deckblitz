import { defineCard } from "../define.js";

export default defineCard({
  name: "City of Solitude",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Players can cast spells and activate abilities only during their own turns.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "cast", who: "each-player", unless: "own-turn" },
        { act: "activate", who: "each-player", anyZone: true, unless: "own-turn" },
      ],
      text: "Players can cast spells and activate abilities only during their own turns.",
    },
  ],
});
