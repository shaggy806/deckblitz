import { defineCard } from "../define.js";

// EDHREC rank 6641.
//
// Rulings:
//   [2022-10-07] Having more than one Plague Drone on the battlefield doesn't have any noticeable
//     effect on life gain. Once the effect of one Plague Drone applies, there is no life gain for
//     the others to apply to.
//   [2022-10-07] If more than one replacement effect tries to apply to a life gain event, the
//     player who would gain life chooses the order in which they apply. For example, if a player
//     who controls Alhammarret's Archive would gain 3 life while Plague Drone is on the
//     battlefield, that player may choose to have the 3 life become doubled to 6 life and then
//     lose 6 life. The player may also choose to apply Plague Drone first, turning "gain 3 life"
//     into "lose 3 life." Alhammarret's Archive would then not apply.
// Tainted Remedy's replacement; Rot Fly is an ability word (rule 207.2c).

const ROT_FLY_TEXT = "Rot Fly — If an opponent would gain life, that player loses that much life instead.";

export default defineCard({
  name: "Plague Drone",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ROT_FLY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", becomesLoss: true },
      text: ROT_FLY_TEXT,
    },
  ],
});
