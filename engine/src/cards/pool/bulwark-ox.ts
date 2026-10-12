import { defineCard } from "../define.js";
import { ATTACKS_WHILE_SADDLED, saddle, saddleText } from "../helpers.js";
import type { CardFilter } from "../../filter.js";

// "Creatures you control with counters on them" — any kind — are the ones
// with counters as the ability resolves (Tyrant Guard's shape).
const ATTACK_TEXT = "Whenever this creature attacks while saddled, put a +1/+1 counter on target creature.";
const SACRIFICE_TEXT =
  "Sacrifice this creature: Creatures you control with counters on them gain hexproof and indestructible until end of turn.";
const withCounters: CardFilter = { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } };

export default defineCard({
  name: "Bulwark Ox",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Ox", "Mount"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${SACRIFICE_TEXT}\n${saddleText(1)}`,
  triggered: [
    {
      ...ATTACKS_WHILE_SADDLED,
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: withCounters, keyword: "hexproof", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: withCounters, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
    saddle(1, saddleText(1)),
  ],
});
