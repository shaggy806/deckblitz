import { defineCard } from "../define.js";

// A "doesn't untap" restriction (rule 502.3) on every nonbasic land, anyone's.
const TEXT = "Nonbasic lands don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Back to Basics",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
      restrictions: ["doesnt-untap"],
      text: TEXT,
    },
  ],
});
