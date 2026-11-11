import { defineCard } from "../define.js";

// EDHREC rank 6918. The life total is noted as it enters (rule 614.1c), not
// by an enters trigger, and again each time the upkeep ability resolves,
// whether or not a card was drawn (its 2021-04-16 ruling).

const NOTE_TEXT = "As this enchantment enters, note your life total.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, draw a card if your life total is greater than or equal to the last noted life total for this enchantment. Then note your life total.";
const WHITE_TEXT = "Whenever you cast a white spell, you gain 1 life.";

export default defineCard({
  name: "Sigarda's Splendor",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${NOTE_TEXT}\n${UPKEEP_TEXT}\n${WHITE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", notes: { lifeTotal: "you" } },
      text: NOTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "amounts", left: { lifeTotal: "you" }, op: "gte", right: { chosenNumber: true } },
            then: { kind: "draw", amount: 1 },
          },
          { kind: "note", amount: { lifeTotal: "you" } },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: WHITE_TEXT,
    },
  ],
});
