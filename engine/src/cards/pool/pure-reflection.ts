import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 26636.
const TEXT =
  "Whenever a player casts a creature spell, destroy all Reflections. Then that player creates an X/X white Reflection creature token, where X is the mana value of that spell.";

export default defineCard({
  name: "Pure Reflection",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { subtype: "Reflection" } },
          {
            kind: "create-token",
            token: "X/X Reflection Token (White)",
            count: 1,
            who: "trigger-controller",
            basePt: { power: { manaValueOf: "trigger-object" }, toughness: { manaValueOf: "trigger-object" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
