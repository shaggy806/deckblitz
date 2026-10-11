import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Demonic Tutor, the
// pool's own card. "If two or more creatures died this turn" — anyone's — is
// an intervening if, checked as your end step begins (the ruling).
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const END_TEXT =
  "At the beginning of your end step, if two or more creatures died this turn, this creature becomes prepared.";

export default defineCard({
  name: "Emeritus of Woe",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 5,
  toughness: 4,
  prepareSpell: "Demonic Tutor",
  text: `${ENTERS_TEXT}\n${END_TEXT}`,
  static: [entersPrepared(ENTERS_TEXT)],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "any-player", filter: { type: "creature" }, atLeast: 2 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
