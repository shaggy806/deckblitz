import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Vicious Verse. "If
// this creature isn't prepared" is an intervening if (rule 603.4) —
// Woodwork Prodigy's shape.
const UPKEEP_TEXT = `At the beginning of your upkeep, if this creature isn't prepared, it becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Stingerquill Voxmancer",
  manaCost: "{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Sorcerer"],
  power: 1,
  toughness: 2,
  prepareSpell: "Vicious Verse",
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
