import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this enchantment enters, target opponent discards two cards.";
const ALONE_TEXT =
  "Whenever a creature you control attacks alone, target opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "HYDRA Infiltration",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${ALONE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ALONE_TEXT,
    },
  ],
});
