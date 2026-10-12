import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// EDHREC rank 13278. A preparation card (rule 722): its prepare spell is
// Oracle's Gift, a spell with no card of its own (`prepareSpellOnly`).
const ENTERS_TEXT = `Jadzi enters prepared. ${PREPARED_REMINDER}`;
const LOOT_TEXT = "When Jadzi enters, draw two cards, then discard two cards.";

export default defineCard({
  name: "Jadzi, Steward of Fate",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  prepareSpell: "Oracle's Gift",
  text: `${ENTERS_TEXT}\n${LOOT_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
