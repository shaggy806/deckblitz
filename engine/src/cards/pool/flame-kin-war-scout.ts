import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] If multiple creatures enter at the same time, Flame-Kin War Scout's ability will
//     trigger multiple times. When the first of these triggers resolves, if Flame Kin War Scout
//     can be sacrificed by the ability's controller, it will be sacrificed and deal 4 damage. When
//     the other triggers resolve, it won't be on the battlefield, so it can't be sacrificed and
//     the other creatures won't be dealt any damage.

const TEXT =
  "When another creature enters, sacrifice this creature. If you do, this creature deals 4 damage to that creature.";

export default defineCard({
  name: "Flame-Kin War Scout",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Scout"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      // `then` is the "if you do": a Scout already gone (the ruling's later
      // triggers) sacrifices nothing and deals nothing.
      effect: {
        kind: "sacrifice-source",
        then: { kind: "damage", amount: 4, target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
