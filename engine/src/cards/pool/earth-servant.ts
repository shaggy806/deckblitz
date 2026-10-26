import { defineCard } from "../define.js";

// EDHREC rank 26611. Magic 2011. Lands with the Mountain type, not just ones
// named Mountain (the ruling).
const TEXT = "This creature gets +0/+1 for each Mountain you control.";

export default defineCard({
  name: "Earth Servant",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Mountain", controlledBy: "you" }, pt: [0, 1] },
      text: TEXT,
    },
  ],
});
