import { defineCard } from "../define.js";

// EDHREC rank 6738.
//
// Rulings:
//   [2015-06-22] Having more than one Tainted Remedy on the battlefield doesn’t have any
//     noticeable effect on life gain. Once the effect of one Tainted Remedy applies, there is no
//     life gain for the others to apply to.
//   [2015-06-22] If more than one replacement effect tries to apply to a life gain event, the
//     player who would gain life chooses the order in which they apply. For example, if a player
//     who controls Alhammarret’s Archive would gain 3 life while Tainted Remedy is on the
//     battlefield, that player may choose to have the 3 life become doubled to 6 life and then
//     lose 6 life. The player may also choose to apply Tainted Remedy first, turning “gain 3 life”
//     into “lose 3 life.” Alhammarret’s Archive would then not apply.

export default defineCard({
  name: "Tainted Remedy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "If an opponent would gain life, that player loses that much life instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", becomesLoss: true },
      text: "If an opponent would gain life, that player loses that much life instead.",
    },
  ],
});
