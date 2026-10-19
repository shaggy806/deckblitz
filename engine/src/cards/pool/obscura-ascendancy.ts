import { defineCard } from "../define.js";

// Streets of New Capenna. An intervening-if (its ruling): the spell's mana
// value is compared with 1 plus the soul counters both as it triggers and as
// it resolves, so two 1-mana spells in a row make only one Spirit. The
// trigger's filter is the check as it triggers, the conditional the check as
// it resolves (the spell as it last existed, if it has left the stack).
const NEXT_MANA_VALUE = {
  manaValue: { op: "eq", n: { amount: { sum: [{ countersOn: "source", counter: "soul" }, 1] } } },
} as const;
const CAST_TEXT =
  "Whenever you cast a spell, if its mana value is equal to 1 plus the number of soul counters on this enchantment, put a soul counter on this enchantment, then create a 2/2 white Spirit creature token with flying.";
const ANTHEM_TEXT = "As long as there are five or more soul counters on this enchantment, Spirits you control get +3/+3.";

export default defineCard({
  name: "Obscura Ascendancy",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["enchantment"],
  text: `${CAST_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: NEXT_MANA_VALUE },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: NEXT_MANA_VALUE },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "soul", amount: 1 },
            { kind: "create-token", token: "Spirit Token (Phantom Interference)", count: 1 },
          ],
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spirit", controlledBy: "you" } },
      condition: { kind: "self-counters", counter: "soul", compare: { op: "gte", n: 5 } },
      grantPt: [3, 3],
      text: ANTHEM_TEXT,
    },
  ],
});
