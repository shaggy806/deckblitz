import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31398.

export default defineCard({
  name: "Flowstone Embrace",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{T}: Enchanted creature gets +2/-2 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 2,
        toughness: -2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Enchanted creature gets +2/-2 until end of turn.",
    },
  ],
});
