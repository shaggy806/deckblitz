import { defineCard } from "../define.js";

// EDHREC rank 9333.

const SCRY_TEXT = "Whenever you scry, put a verse counter on this enchantment.";
const EXILE_TEXT =
  "{4}{U}{U}, Exile this enchantment: Draw a card for each verse counter on this enchantment. If it had seven or more verse counters on it, take an extra turn after this one. Activate only as a sorcery.";

// The enchantment is exiled to pay the cost, so both the count and "if it
// had" read it as it last existed on the battlefield (rule 608.2h).
export default defineCard({
  name: "Lost Isle Calling",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${SCRY_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "verse", amount: 1 },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{U}{U}", tap: false, exileSelf: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { countersOn: "source", counter: "verse" } },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "verse", compare: { op: "gte", n: 7 } },
            then: { kind: "take-extra-turn" },
          },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
      sorcerySpeed: true,
    },
  ],
});
