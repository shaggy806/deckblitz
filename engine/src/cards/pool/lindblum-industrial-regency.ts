import { defineCard } from "../define.js";

// A land with an Adventure (rule 715): played from hand, or cast as Mage Siege
// and played later from exile.
export default defineCard({
  name: "Lindblum, Industrial Regency",
  colors: [],
  types: ["land"],
  subtypes: ["Town"],
  text: "This land enters tapped.\n{T}: Add {R}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Lindblum, Industrial Regency", "Mage Siege"],
  adventure: true,
});
