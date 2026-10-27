import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 9260.

export default defineCard({
  name: "Dream's Grip",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: { cost: "{1}", keyword: "entwine" },
  text: "Choose one —\n• Tap target permanent.\n• Untap target permanent.\nEntwine {1} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Tap target permanent.",
        targets: ["permanent"],
        effect: { kind: "tap", target: 0 },
      },
      {
        text: "Untap target permanent.",
        targets: ["permanent"],
        effect: { kind: "untap", target: 0 },
      },
    ],
    kickedModes: 2,
  },
});
