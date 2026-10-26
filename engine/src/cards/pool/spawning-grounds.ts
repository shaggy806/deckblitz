import { defineCard } from "../define.js";

const GRANT_TEXT = 'Enchanted land has "{T}: Create a 5/5 green Beast creature token with trample."';

export default defineCard({
  name: "Spawning Grounds",
  manaCost: "{6}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\n${GRANT_TEXT}`,
  targets: ["land"],
  static: [
    {
      // Squirrel Nest's shape.
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "create-token", token: "5/5 Green Beast Token (Trample)", count: 1 },
          resolve: null,
          text: "{T}: Create a 5/5 green Beast creature token with trample.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
