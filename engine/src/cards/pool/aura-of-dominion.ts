import { defineCard } from "../define.js";

export default defineCard({
  name: "Aura of Dominion",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{1}, Tap an untapped creature you control: Untap enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "{1}, Tap an untapped creature you control: Untap enchanted creature.",
    },
  ],
});
