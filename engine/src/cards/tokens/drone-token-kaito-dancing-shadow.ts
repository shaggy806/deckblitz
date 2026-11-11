import { defineCard } from "../define.js";

const LEAVES = "When this token leaves the battlefield, each opponent loses 2 life and you gain 2 life.";

/** 2/2 colorless Drone artifact creature with deathtouch — Kaito, Dancing
 * Shadow's token. */
export default defineCard({
  name: "Drone Token (Kaito, Dancing Shadow)",
  art: "cfacac5f-7685-4792-9e4c-166d4b421240",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Drone"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "each-opponent", amount: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: LEAVES,
    },
  ],
});
