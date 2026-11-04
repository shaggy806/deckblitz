import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

/** Each opponent once, however many sources hit them: this creature in this
 * stint, or a Dragon as it dealt the damage. */
const DAMAGED_OPPONENTS: EffectAmount = {
  countPlayers: "each-opponent",
  where: {
    kind: "of-player",
    player: "that-player",
    condition: {
      kind: "any",
      of: [
        { kind: "turn-history", what: "combat-damaged-by", selfOnly: true },
        { kind: "turn-history", what: "combat-damaged-by", filter: { subtype: "Dragon" } },
      ],
    },
  },
};

// EDHREC rank 10161.
//
// Rulings:
//   [2025-06-06] Estinien Varlineau's first ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered or otherwise leaves the stack.

export default defineCard({
  name: "Estinien Varlineau",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever you cast a noncreature spell, put a +1/+1 counter on Estinien Varlineau. It gains flying until end of turn.\nAt the beginning of your second main phase, you draw X cards and lose X life, where X is the number of your opponents who were dealt combat damage by Estinien Varlineau or a Dragon this turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever you cast a noncreature spell, put a +1/+1 counter on Estinien Varlineau. It gains flying until end of turn.",
    },
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      condition: { kind: "turn-structure", mainPhase: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: DAMAGED_OPPONENTS },
          { kind: "lose-life", amount: DAMAGED_OPPONENTS, who: "you" },
        ],
      },
      resolve: null,
      text: "At the beginning of your second main phase, you draw X cards and lose X life, where X is the number of your opponents who were dealt combat damage by Estinien Varlineau or a Dragon this turn.",
    },
  ],
});
