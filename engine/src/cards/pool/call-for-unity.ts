import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 8290.
//
// Rulings:
//   [2017-02-09] All cards in the Aether Revolt set with triggered revolt abilities use an
//     intervening "if" clause. A permanent you controlled must have left the battlefield earlier
//     in the turn in order for these abilities to trigger; otherwise they do nothing. In other
//     words, there's no way to have the ability trigger if no permanent you controlled has left
//     the battlefield that turn, even if you intend to have one do so in response to the triggered
//     ability.
//   [2017-02-09] Revolt abilities check only whether a permanent you controlled left the
//     battlefield this turn or not. They don't apply multiple times if more than one permanent you
//     controlled left the battlefield. They don't check whether the permanent that left the
//     battlefield is still in the zone it moved to.
//   [2017-02-09] Energy counters aren't permanents. Paying {E} won't satisfy a revolt ability.
//   [2017-02-09] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2017-02-09] Revolt abilities don't care why the permanent left the battlefield, who caused it
//     to move, or where it moved to. They're equally satisfied by an artifact you sacrificed to
//     pay a cost, a creature you controlled that was destroyed by Murder, or an enchantment you
//     returned to your hand with Leave in the Dust.
const REVOLT_TEXT =
  "Revolt — At the beginning of your end step, if a permanent left the battlefield under your control this turn, put a unity counter on this enchantment.";
const PUMP_TEXT = "Creatures you control get +1/+1 for each unity counter on this enchantment.";

export default defineCard({
  name: "Call for Unity",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${REVOLT_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: REVOLT_CONDITION,
      effect: { kind: "add-counter", target: "source", counter: "unity", amount: 1 },
      resolve: null,
      text: REVOLT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantPtPerCount: { countersOnSource: "unity", pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
