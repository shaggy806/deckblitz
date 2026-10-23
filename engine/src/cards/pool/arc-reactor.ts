import { defineCard } from "../define.js";

export default defineCard({
  name: "Arc Reactor",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nThis artifact enters tapped.\n{T}: Add {C}{C}{C}.",
  // Improvise (rule 702.126a): artifacts tapped as it's cast pay its generic mana.
  improvise: true,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 3 },
      resolve: null,
      text: "{T}: Add {C}{C}{C}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
