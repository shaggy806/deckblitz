import { defineCard } from "../define.js";

// EDHREC rank 17517.

export default defineCard({
  name: "Choke",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Islands don't untap during their controllers' untap steps.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Island" } },
      restrictions: ["doesnt-untap"],
      text: "Islands don't untap during their controllers' untap steps.",
    },
  ],
});
