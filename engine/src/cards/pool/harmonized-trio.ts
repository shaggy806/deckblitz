import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Brainstorm, the pool's
// own card. The two creatures tapped for the cost may be summoning sick (the
// ruling — only a {T} cost needs them to have been there, rule 302.6).
const PREPARE_TEXT = `{T}, Tap two untapped creatures you control: This creature becomes prepared. ${PREPARED_REMINDER}`;

export default defineCard({
  name: "Harmonized Trio",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Bard", "Wizard"],
  power: 1,
  toughness: 1,
  prepareSpell: "Brainstorm",
  text: PREPARE_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
});
