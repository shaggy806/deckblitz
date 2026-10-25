import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 12889.

const EXTRA_TURN_TEXT = "At the beginning of each end step, if it's not your turn, take an extra turn after this one.";

export default defineCard({
  name: "Lighthouse Chronologist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `Level up {U} ({U}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 4-6\n2/4\nLEVEL 7+\n3/5\n${EXTRA_TURN_TEXT}`,
  activated: [levelUp("{U}")],
  static: [
    levelStatic(levelBand(4, 6), 2, 4, "LEVEL 4-6\n2/4"),
    levelStatic(levelBand(7), 3, 5, "LEVEL 7+\n3/5"),
  ],
  triggered: [
    {
      // The ability exists only at level 7+ (rule 711.2b), so the band is
      // part of the trigger condition; "if it's not your turn" is the
      // intervening if (rule 603.4).
      trigger: { on: "step-begins", step: "end", who: "any" },
      whileCondition: levelBand(7),
      condition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "take-extra-turn" },
      resolve: null,
      text: EXTRA_TURN_TEXT,
    },
  ],
});
