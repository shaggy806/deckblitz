import { defineCard } from "../define.js";

const TEXT = "This token's power and toughness are each equal to the number of artifacts and/or creatures you control.";

// Thousand Moons Smithy's token. It counts itself, as an artifact and a creature
// once, so it's never below 1/1 while it's yours.
export default defineCard({
  name: "Gnome Soldier Token",
  art: "cbe7c36a-77b7-4418-9e2d-b6aeea61502e",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome", "Soldier"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
