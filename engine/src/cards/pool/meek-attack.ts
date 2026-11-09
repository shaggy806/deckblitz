import { defineCard } from "../define.js";

const TEXT =
  "{1}{R}: You may put a creature card with total power and toughness 5 or less from your hand onto the battlefield. That creature gains haste. At the beginning of the next end step, sacrifice that creature.";

// EDHREC rank 19163. Sneak Attack's shape; sacrificed only if it's still the
// same permanent and you still control it (its ruling).
export default defineCard({
  name: "Meek Attack",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", totalPowerToughness: { op: "lte", n: 5 } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: { step: "end" },
              effect: { kind: "sacrifice-target", target: 0 },
              text: "At the beginning of the next end step, sacrifice that creature.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
