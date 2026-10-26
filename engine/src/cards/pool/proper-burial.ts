import { defineCard } from "../define.js";

// Dissension. EDHREC rank 17816. Its toughness as it last existed on the
// battlefield (South Wind Avatar's shape).

const TEXT = "Whenever a creature you control dies, you gain life equal to that creature's toughness.";

export default defineCard({
  name: "Proper Burial",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
