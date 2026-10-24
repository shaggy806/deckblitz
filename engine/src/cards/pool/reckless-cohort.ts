import { defineCard } from "../define.js";

const TEXT = "This creature attacks each combat if able unless you control another Ally.";

// Checked as attackers are declared (the ruling): a live static condition.
export default defineCard({
  name: "Reckless Cohort",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Ally" }, atLeast: 1, excludeSelf: true } },
      restrictions: ["must-attack"],
      text: TEXT,
    },
  ],
});
