import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// Each chapter notes a type not noted for this Saga before
// (`choose-creature-type`'s `note`), then waits for the next creature spell of
// that type this turn (`nextSpell`, once, this turn only), which enters with
// the counter.

const CHAPTER_TEXT =
  "I, II, III, IV, V, VI — Note a creature type that hasn't been noted for this Saga. When you next cast a creature spell of that type this turn, that creature enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Long List of the Ents",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after VI.)\n${CHAPTER_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3, 4, 5, 6],
      targets: [],
      effect: {
        kind: "choose-creature-type",
        note: true,
        then: {
          kind: "delayed-trigger",
          at: { nextSpell: { type: "creature", subtype: CHOSEN_CREATURE_TYPE } },
          effect: { kind: "enters-with-counters", target: "trigger-object", counter: "+1/+1", amount: 1 },
          text: "That creature enters with an additional +1/+1 counter on it.",
        },
      },
      resolve: null,
      text: CHAPTER_TEXT,
    },
  ],
});
