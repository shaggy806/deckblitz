import { defineCard } from "../define.js";

// EDHREC rank 6971.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Donatello, the Brains",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 4,
  pairing: { kind: "partner-group", group: "Character select" },
  text: "If one or more tokens would be created under your control, those tokens plus a Mutagen token are created instead.\nPartner—Character select (You can have two commanders if both have this ability.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Mutagen Token" },
      text: "If one or more tokens would be created under your control, those tokens plus a Mutagen token are created instead.",
    },
  ],
});
