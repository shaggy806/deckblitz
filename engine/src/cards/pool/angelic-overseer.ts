import { defineCard } from "../define.js";

// EDHREC rank 15809.
//
// Rulings:
//   [2011-09-22] If you control a Human, and lethal damage is dealt to Angelic Overseer, that
//     damage will remain marked on it that turn. If later in the turn you no longer control a
//     Human, Angelic Overseer will be destroyed.
//   [2011-09-22] If you control a Human, and an effect tries to destroy each Human you control and
//     Angelic Overseer simultaneously, Angelic Overseer won’t be destroyed.

const TEXT = "As long as you control a Human, this creature has hexproof and indestructible.";

export default defineCard({
  name: "Angelic Overseer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Human" }, atLeast: 1 },
      grantKeywords: ["hexproof", "indestructible"],
      text: TEXT,
    },
  ],
});
