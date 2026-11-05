import { defineCard } from "../define.js";

// EDHREC rank 14317.
//
// Damage is asked of the creature before it's destroyed, where it still reads as it is: destroying
// it deals none, so the answer is the same as it would be after.

export default defineCard({
  name: "Faller's Faithful",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, destroy up to one other target creature. If that creature wasn't dealt damage this turn, its controller draws two cards.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { damagedThisTurnBy: {} } },
        then: { kind: "destroy", target: 0 },
        else: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "draw", who: { controllerOfTarget: 0 }, amount: 2 },
          ],
        },
      },
      resolve: null,
      text: "When this creature enters, destroy up to one other target creature. If that creature wasn't dealt damage this turn, its controller draws two cards.",
    },
  ],
});
