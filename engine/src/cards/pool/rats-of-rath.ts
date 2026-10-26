import { defineCard } from "../define.js";

// EDHREC rank 24328.

export default defineCard({
  name: "Rats of Rath",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  text: "{B}: Destroy target artifact, creature, or land you control.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [
        { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "you" } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}: Destroy target artifact, creature, or land you control.",
    },
  ],
});
