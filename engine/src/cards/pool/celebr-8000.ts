import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { Keyword } from "../define.js";

// Two six-sided dice in one roll (rule 706): each result of 1 is +1/+1, each
// other result its row's keyword (a result past 6 gives none), and doubles —
// one distinct number over the two dice (706.5) — double strike.
const gains = (result: number, keyword: Keyword): EffectSpec => ({
  kind: "conditional",
  condition: { kind: "amounts", left: { roll: { equals: result } }, op: "gte", right: 1 },
  then: { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" },
});

export default defineCard({
  name: "Celebr-8000",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Clown", "Robot"],
  power: 3,
  toughness: 3,
  text:
    "At the beginning of combat on your turn, roll two six-sided dice. For each result of 1, this creature gets +1/+1 until end of turn. For each other result, it gains the indicated ability until end of turn. If you rolled doubles, it also gains double strike until end of turn.\n" +
    "• 2 — menace\n• 3 — vigilance\n• 4 — lifelink\n• 5 — flying\n• 6 — indestructible",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        count: 2,
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt",
              target: "source",
              power: { roll: { equals: 1 } },
              toughness: { roll: { equals: 1 } },
              duration: "end-of-turn",
            },
            gains(2, "menace"),
            gains(3, "vigilance"),
            gains(4, "lifelink"),
            gains(5, "flying"),
            gains(6, "indestructible"),
            {
              kind: "conditional",
              condition: { kind: "amounts", left: { roll: "distinct" }, op: "eq", right: 1 },
              then: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, roll two six-sided dice. For each result of 1, this creature gets +1/+1 until end of turn. For each other result, it gains the indicated ability until end of turn. If you rolled doubles, it also gains double strike until end of turn.",
    },
  ],
});
