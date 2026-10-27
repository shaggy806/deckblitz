import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

export default defineCard({
  name: "Furnace Dragon",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  selfCostReduction: affinity({ type: "artifact" }),
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\nWhen this creature enters, if you cast it from your hand, exile all artifacts.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: { kind: "exile-all", filter: { type: "artifact" } },
      resolve: null,
      text: "When this creature enters, if you cast it from your hand, exile all artifacts.",
    },
  ],
});
