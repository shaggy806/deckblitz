import { defineCard } from "../define.js";

// EDHREC rank 26376.
//
// Rulings:
//   [2007-05-01] If multiple nonblack creatures enter at the same time, Grave Peril will destroy
//     only one of them. Grave Peril's ability will trigger multiple times, but only the first one
//     to resolve will do anything.
//   [2007-05-01] If a nonblack creature enters and Grave Peril triggers, then another nonblack
//     creature enters, Grave Peril will trigger again and destroy only the last creature to enter.
//   [2007-05-01] This ability is not optional.
//
// `sacrifice-source`'s `then` runs only if the sacrifice happened, so a
// second trigger resolving after the first did nothing.

const TEXT = "When a nonblack creature enters, sacrifice this enchantment. If you do, destroy that creature.";

export default defineCard({
  name: "Grave Peril",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", notColors: ["B"] } },
      targets: [],
      effect: { kind: "sacrifice-source", then: { kind: "destroy", target: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
