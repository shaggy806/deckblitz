import { defineCard } from "../define.js";

const TEXT = "If a source would deal 4 or more damage to a permanent or player, that source deals 3 damage to that permanent or player instead.";

export default defineCard({
  name: "Divine Presence",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", ifAtLeast: 4, instead: { modify: { set: 3 } } },
      text: TEXT,
    },
  ],
});
