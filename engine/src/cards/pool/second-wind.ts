import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17456.

export default defineCard({
  name: "Second Wind",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{T}: Tap enchanted creature.\n{T}: Untap enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "tap", target: "attached" },
      resolve: null,
      text: "{T}: Tap enchanted creature.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "{T}: Untap enchanted creature.",
    },
  ],
});
