import { defineCard } from "../define.js";

const TEXT = "During combat, players can't cast instant spells or activate abilities that aren't mana abilities.";

export default defineCard({
  name: "Hand to Hand",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-structure", duringCombat: true },
      prohibits: [{ act: "cast", who: "each-player", filter: { type: "instant" } }, { act: "activate", who: "each-player", except: ["mana"], anyZone: true }],
      text: TEXT,
    },
  ],
});
