import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// EDHREC rank 11988.
//
// Rulings:
//   [2013-01-24] To determine how much life each opponent gains, use the power of the creature
//     that opponent controlled as it last existed on the battlefield.
//   [2013-01-24] You can choose a number of targets up to the number of opponents you have, one
//     target per opponent.
// "For each opponent, … up to one target creature that player controls" is one
// optional slot per seat (Haytham Kenway), exiled as one instruction; then each
// exiled creature's controller gains life equal to its power, read as it last
// existed (Swords to Plowshares' `toControllerOfTarget` + `powerOf`, both
// last-known information). An empty slot gains nobody anything.

const ENTER_TEXT =
  "When this creature enters, for each opponent, exile up to one target creature that player controls and that player gains life equal to its power.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Luminate Primordial",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 7,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "exile", target: 0 },
              { kind: "exile", target: 1 },
              { kind: "exile", target: 2 },
            ],
          },
          { kind: "gain-life", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
          { kind: "gain-life", amount: { powerOf: 1 }, toControllerOfTarget: 1 },
          { kind: "gain-life", amount: { powerOf: 2 }, toControllerOfTarget: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
