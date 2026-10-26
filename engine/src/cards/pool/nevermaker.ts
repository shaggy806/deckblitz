import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17022.

export default defineCard({
  name: "Nevermaker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  evoke: { cost: "{3}{U}" },
  text: "Flying\nWhen this creature leaves the battlefield, put target nonland permanent on top of its owner's library.\nEvoke {3}{U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["nonland-permanent"],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: "When this creature leaves the battlefield, put target nonland permanent on top of its owner's library.",
    },
  ],
});
