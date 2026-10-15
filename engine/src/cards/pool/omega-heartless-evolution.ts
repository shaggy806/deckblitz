import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 9140.
//
// Rulings:
//   [2025-06-06] The value of X is calculated only once, as Omega's ability resolves.
//
// Hapatra, the Desert Frost's per-opponent target slots (one optional slot per
// opponent seat, filled only where that seat has a legal target), with X read
// as the ability resolves. The life is gained once, whatever was targeted;
// nothing between the counters and the life gain changes how many nonbasic
// lands you control, so X is the same number both times.

const ETB_TEXT =
  "Wave Cannon — When Omega enters, for each opponent, tap up to one target nonland permanent that opponent controls. Put X stun counters on each of those permanents and you gain X life, where X is the number of nonbasic lands you control.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

const X = { countOf: { type: "land", notSupertype: "basic", controlledBy: "you" } } as const;

export default defineCard({
  name: "Omega, Heartless Evolution",
  manaCost: "{5}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 8,
  toughness: 8,
  text: `${ETB_TEXT} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "tap", target: 1 },
          { kind: "tap", target: 2 },
          { kind: "add-counter", target: 0, counter: "stun", amount: X },
          { kind: "add-counter", target: 1, counter: "stun", amount: X },
          { kind: "add-counter", target: 2, counter: "stun", amount: X },
          { kind: "gain-life", amount: X },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
