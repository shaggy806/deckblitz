import { defineCard } from "../define.js";
import { PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 13975. A preparation card (rule 722): its prepare spell is
// Bloodletting, a spell with no card of its own (`prepareSpellOnly`). Already
// prepared, it doesn't become prepared again (the ruling) — `become-prepared`
// does nothing then.
const GAIN_TEXT = "Whenever you gain life for the first time each turn, this creature becomes prepared.";

export default defineCard({
  name: "Leech Collector",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 2,
  prepareSpell: "Bloodletting",
  text: `${GAIN_TEXT} ${PREPARED_REMINDER}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
