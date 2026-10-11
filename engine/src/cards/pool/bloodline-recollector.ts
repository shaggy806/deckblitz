import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Ancestral Craving.
// "Each end step", anyone's; "three or more creatures died this turn" counts
// every creature that died, whoever controlled it — an intervening if
// (rule 603.4), asked as the end step begins and again on resolution.
const PREPARE_TEXT =
  "At the beginning of each end step, if three or more creatures died this turn, this creature becomes " +
  `prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Bloodline Recollector",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 2,
  toughness: 2,
  prepareSpell: "Ancestral Craving",
  text: PREPARE_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "died", who: "any-player", filter: { type: "creature" }, atLeast: 3 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
