import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27449.

export default defineCard({
  name: "Silkbind Faerie",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{1}{W/U}, {Q}: Tap target creature. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{1}{W/U}", tap: false, untap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W/U}, {Q}: Tap target creature.",
    },
  ],
});
