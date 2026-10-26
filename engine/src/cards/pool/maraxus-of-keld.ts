import { defineCard } from "../define.js";

// EDHREC rank 25133. A CDA counting untapped permanents that are an artifact, a
// creature or a land — each once, however many of those types it has (the
// ruling) — Maraxus himself included while he's untapped.

const TEXT =
  "Maraxus's power and toughness are each equal to the number of untapped artifacts, creatures, and lands you control.";

export default defineCard({
  name: "Maraxus of Keld",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          countOf: { typesAnyOf: ["artifact", "creature", "land"], tapped: false, controlledBy: "you" },
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: TEXT,
    },
  ],
});
