import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 23267.
//
// Rulings:
//   [2017-02-09] Tokens that leave the battlefield will satisfy a revolt ability.
//   [2017-02-09] If Decommission destroys a permanent you control, it will enable its own revolt
//     ability and you'll gain 3 life.
//   [2017-02-09] Revolt abilities check only whether a permanent you controlled left the
//     battlefield this turn or not. They don't apply multiple times if more than one permanent you
//     controlled left the battlefield. They don't check whether the permanent that left the
//     battlefield is still in the zone it moved to.
//   [2017-02-09] Revolt abilities don't care why the permanent left the battlefield, who caused it
//     to move, or where it moved to. They're equally satisfied by an artifact you sacrificed to
//     pay a cost, a creature you controlled that was destroyed by Murder, or an enchantment you
//     returned to your hand with Leave in the Dust.
//   [2017-02-09] Energy counters aren't permanents. Paying {E} won't satisfy a revolt ability.
//   [2017-02-09] If the target artifact or enchantment becomes an illegal target, Decommission
//     doesn't resolve and none of its effects happen. You won't gain life.
export default defineCard({
  name: "Decommission",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Destroy target artifact or enchantment.\n" +
    "Revolt — If a permanent left the battlefield under your control this turn, you gain 3 life.",
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "conditional", condition: REVOLT_CONDITION, then: { kind: "gain-life", amount: 3 } },
    ],
  },
});
