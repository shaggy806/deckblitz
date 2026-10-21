import { defineCard } from "../define.js";

// EDHREC rank 30811. Rivals of Ixalan.
//
// Vampire Slayer's shape, for a Dinosaur: any damage, combat or not.

export default defineCard({
  name: "Dinosaur Hunter",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature deals damage to a Dinosaur, destroy that creature.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", toFilter: { subtype: "Dinosaur" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: "Whenever this creature deals damage to a Dinosaur, destroy that creature.",
    },
  ],
});
