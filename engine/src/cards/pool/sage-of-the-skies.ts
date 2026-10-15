import { defineCard } from "../define.js";

// EDHREC rank 12638.
//
// "If you've cast another spell this turn" is an intervening-if (rule 603.4)
// on the cast trigger: this spell is already among the spells cast this turn
// when it triggers, so "another" is two or more. A copy isn't cast (rule
// 707.10), so the copy doesn't count or trigger, and it becomes a token as it
// resolves.

const CAST_TEXT = "When you cast this spell, if you've cast another spell this turn, copy this spell.";

export default defineCard({
  name: "Sage of the Skies",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  text: `${CAST_TEXT} (The copy becomes a token.)\nFlying, lifelink`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
