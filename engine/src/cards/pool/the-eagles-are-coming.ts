import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 9664. A token returned counts (the ruling); the count is fixed
// when the delayed ability is made, read at the next upkeep.
const AT_NEXT_UPKEEP: EffectSpec = {
  kind: "delayed-trigger",
  at: "next-upkeep",
  remember: { returned: { set: { thisWay: "returned-to-hand" } } },
  effect: {
    kind: "create-token",
    token: "Bird Soldier Token (4/4 Flying)",
    count: { aggregate: "count", filter: {}, in: { remembered: "returned" } },
  },
  text: "At the beginning of the next upkeep, create a 4/4 white Bird Soldier creature token with flying for each creature returned to your hand this way.",
};

export default defineCard({
  name: "The Eagles Are Coming!",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {2}{W}{W} (You may pay an additional {2}{W}{W} as you cast this spell.)\nChoose target creature you own. If this spell was kicked, instead choose any number of target creatures you own. Return each chosen creature to your hand. At the beginning of the next upkeep, create a 4/4 white Bird Soldier creature token with flying for each creature returned to your hand this way.",
  targets: [{ kind: "permanent", filter: { type: "creature", ownedBy: "you" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, AT_NEXT_UPKEEP],
  },
  kicker: {
    cost: "{2}{W}{W}",
    targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", ownedBy: "you" } } }],
    effect: {
      kind: "sequence",
      effects: [{ kind: "for-each-target", from: 0, effect: { kind: "return-to-hand", target: 0 }, simultaneous: true }, AT_NEXT_UPKEEP],
    },
  },
});
