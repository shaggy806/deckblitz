import { defineCard } from "../define.js";

// A land with an Adventure (rule 715): played from hand, or cast as Reactor
// Raid and played later from exile.
export default defineCard({
  name: "Midgar, City of Mako",
  colors: [],
  types: ["land"],
  subtypes: ["Town"],
  text: "This land enters tapped.\n{T}: Add {B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Midgar, City of Mako", "Reactor Raid"],
  adventure: true,
});
