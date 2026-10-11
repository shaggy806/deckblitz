import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Sign in Blood, the
// pool's own card. "Your second main phase" is the postcombat main phase
// that is the turn's second (Kona, Rescue Beastie's shape); "if you gained 2
// or more life this turn" is an intervening if, checked as it begins (the
// ruling).
const MAIN_TEXT =
  "At the beginning of your second main phase, if you gained 2 or more life this turn, this creature becomes " +
  `prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Scheming Silvertongue",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "lifelink"],
  prepareSpell: "Sign in Blood",
  text: `Flying, lifelink\n${MAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", mainPhase: 2 },
          { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 2 },
        ],
      },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
