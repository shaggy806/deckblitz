import { defineCard } from "../define.js";

// EDHREC rank 23501.
//
// A preparation card (rule 722): its prepare spell is Omit Variables. "If
// this creature isn't prepared" is an intervening if (rule 603.4) —
// Stingerquill Voxmancer's shape.
const UPKEEP_TEXT = "At the beginning of your upkeep, if this creature isn't prepared, it becomes prepared.";
const BOTTOM_TEXT = "{2}: Put target card from your graveyard on the bottom of your library.";

export default defineCard({
  name: "Paradox Shaper",
  manaCost: "{1}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 1,
  toughness: 3,
  prepareSpell: "Omit Variables",
  text: `${UPKEEP_TEXT}\n${BOTTOM_TEXT}`,
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
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: BOTTOM_TEXT,
    },
  ],
});
