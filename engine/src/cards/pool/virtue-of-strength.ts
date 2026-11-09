import { defineCard } from "../define.js";

// EDHREC rank 2893. A `manaProduction` rule narrowed to basic lands: only
// lands tapped for mana by you, multiple Virtues compounding (the ruling).

const TEXT = "If you tap a basic land for mana, it produces three times as much of that mana instead.";

export default defineCard({
  name: "Virtue of Strength",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [{ filter: { type: "land", supertype: "basic" }, tapper: "you", times: 3 }],
      text: TEXT,
    },
  ],
  faces: ["Virtue of Strength", "Garenbrig Growth"],
  adventure: true,
});
