import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// "For each opponent, … up to one target … that player controls" is one
// optional slot per seat (a game seats at most four), exiled together and
// returned the moment this leaves (rule 610.3 — `untilSourceLeaves`). Gone
// before this resolves, nothing is exiled (the ruling).
const TEXT =
  "When this enchantment enters, for each opponent, exile up to one target nonland permanent that player controls until this enchantment leaves the battlefield.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Grasp of Fate",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TEXT} (Those permanents return under their owners' control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "exile", target: 1, untilSourceLeaves: true },
          { kind: "exile", target: 2, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
