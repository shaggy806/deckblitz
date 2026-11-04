import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty. March of Swirling Mist's cost, with a plain X.

const EXILE_TEXT =
  "As an additional cost to cast this spell, you may exile any number of black cards from your hand. This spell costs {2} less to cast for each card exiled this way.";

export default defineCard({
  name: "March of Wretched Sorrow",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `${EXILE_TEXT}\nMarch of Wretched Sorrow deals X damage to target creature or planeswalker and you gain X life.`,
  additionalCost: { exileFromHandReduces: { filter: { colors: ["B"] }, each: 2 } },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "gain-life", amount: "x" },
    ],
  },
});
