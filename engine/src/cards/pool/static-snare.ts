import { defineCard } from "../define.js";

// EDHREC rank 16237.

const ETB_TEXT =
  "When this enchantment enters, exile target artifact or creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Static Snare",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\nThis spell costs {1} less to cast for each attacking creature.\n${ETB_TEXT}`,
  // Every attacking creature, whoever controls it (Ancient Stone Idol's).
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", attacking: true } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, return the exiled card.",
    },
  ],
});
