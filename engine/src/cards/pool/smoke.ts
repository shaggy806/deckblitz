import { defineCard } from "../define.js";

const TEXT = "Players can't untap more than one creature during their untap steps.";

export default defineCard({
  name: "Smoke",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      untapLimit: { who: "each-player", count: 1, filter: { type: "creature" } },
      text: TEXT,
    },
  ],
});
