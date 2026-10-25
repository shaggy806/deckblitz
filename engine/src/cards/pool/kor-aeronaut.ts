import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 30924.

export default defineCard({
  name: "Kor Aeronaut",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  kicker: { cost: "{1}{W}" },
  text: "Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\nFlying\nWhen this creature enters, if it was kicked, target creature gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, if it was kicked, target creature gains flying until end of turn.",
      condition: { kind: "self-kicked" },
    },
  ],
});
