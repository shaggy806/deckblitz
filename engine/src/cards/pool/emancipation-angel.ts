import { defineCard } from "../define.js";

// EDHREC rank 13697.
//
// Rulings:
//   [2018-12-07] For Emancipation Angel’s triggered ability, the permanent to return is chosen as
//     the ability resolves. No player may take actions between the time you choose the permanent
//     and the time it’s returned to its owner’s hand.
//   [2018-12-07] If Emancipation Angel is still on the battlefield as its triggered ability
//     resolves, you may return Emancipation Angel itself.
//
// Kor Skyfisher's trigger: chosen on resolution, the Angel itself included.

export default defineCard({
  name: "Emancipation Angel",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return a permanent you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a permanent you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a permanent you control to its owner's hand.",
    },
  ],
});
