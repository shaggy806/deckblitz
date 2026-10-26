import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23137.

export default defineCard({
  name: "Shackles",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\n{W}: Return this Aura to its owner's hand.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{W}: Return this Aura to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
