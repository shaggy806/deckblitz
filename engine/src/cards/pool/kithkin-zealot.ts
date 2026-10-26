import { defineCard } from "../define.js";

// EDHREC rank 27835.
//
// Rulings:
//   [2008-08-01] Each permanent is counted only once. For example, if the targeted player controls
//     a black creature, a red enchantment, and a black-red creature, you’ll gain 3 life.
//
// `forTarget` reads the count's "you" as the targeted opponent; the `anyOf`
// counts a black-red permanent once.

export default defineCard({
  name: "Kithkin Zealot",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Cleric"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, you gain 1 life for each black and/or red permanent target opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "gain-life",
        amount: {
          countOf: { controlledBy: "you", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
          forTarget: 0,
        },
      },
      resolve: null,
      text: "When this creature enters, you gain 1 life for each black and/or red permanent target opponent controls.",
    },
  ],
});
