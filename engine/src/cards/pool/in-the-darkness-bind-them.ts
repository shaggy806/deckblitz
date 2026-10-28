import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const WRAITH_TEXT = "I, II, III — Create a 3/3 black Wraith creature token with menace. The Ring tempts you.";
const STEAL_TEXT =
  "IV — For each opponent, gain control of up to one target creature that player controls until end of turn. Untap those creatures. They gain haste until end of turn. The Ring tempts you.";

// Mass Mutiny's shape: one optional slot per opponent seat.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

const steal = (slot: number): EffectSpec[] => [
  { kind: "gain-control", target: slot, untilEndOfTurn: true },
  { kind: "untap", target: slot },
  { kind: "grant-keyword", target: slot, keyword: "haste", duration: "end-of-turn" },
];

export default defineCard({
  name: "In the Darkness Bind Them",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${WRAITH_TEXT}\n${STEAL_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "create-token", token: "Wraith Token", count: 1 }, { kind: "the-ring-tempts-you" }],
      },
      resolve: null,
      text: WRAITH_TEXT,
    },
    {
      at: [4],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [...steal(0), ...steal(1), ...steal(2), { kind: "the-ring-tempts-you" }],
      },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
