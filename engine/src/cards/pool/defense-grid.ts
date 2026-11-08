import { defineCard } from "../define.js";

export default defineCard({
  name: "Defense Grid",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "Each spell costs {3} more to cast except during its controller's turn.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increaseGeneric: 3, when: { exceptOnCastersTurn: true } },
      text: "Each spell costs {3} more to cast except during its controller's turn.",
    },
  ],
});
