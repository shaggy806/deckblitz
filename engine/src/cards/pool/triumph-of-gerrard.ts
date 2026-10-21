import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 16638.

const COUNTER_TEXT = "I, II — Put a +1/+1 counter on target creature you control with the greatest power.";
const GRANT_TEXT =
  "III — Target creature you control with the greatest power gains flying, first strike, and lifelink until end of turn.";

// "With the greatest power among creatures you control" — ties all qualify,
// and a target that's no longer the greatest as it resolves is illegal (the
// ruling): the filter is asked again then.
const GREATEST: TargetSpec = {
  kind: "permanent",
  whose: "you",
  filter: { type: "creature", greatestAmongItsController: { of: "power", among: { type: "creature" } } },
};

export default defineCard({
  name: "Triumph of Gerrard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${COUNTER_TEXT}\n${GRANT_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [GREATEST],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      at: [3],
      targets: [GREATEST],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
