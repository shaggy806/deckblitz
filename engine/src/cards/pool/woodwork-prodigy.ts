import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Soul Tether. "If this
// creature isn't prepared" is an intervening if (rule 603.4).
const UPKEEP_TEXT = `At the beginning of your upkeep, if this creature isn't prepared, it becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Woodwork Prodigy",
  manaCost: "{2}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Druid"],
  power: 3,
  toughness: 3,
  prepareSpell: "Soul Tether",
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source", filter: { prepared: false } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
