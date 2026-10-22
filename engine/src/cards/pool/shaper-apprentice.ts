import { defineCard } from "../define.js";

// EDHREC rank 23736. Ixalan. A static's `controls` condition leaves its own
// permanent out: "another Merfolk" (Stampeding Horncrest).
const TEXT = "This creature has flying as long as you control another Merfolk.";

export default defineCard({
  name: "Shaper Apprentice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Merfolk" }, atLeast: 1 },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
