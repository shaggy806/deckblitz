import { defineCard } from "../define.js";

// EDHREC rank 13599.
//
// Rulings:
//   You may return Stonecloaker itself to its owner's hand as its first triggered ability resolves. If you don't control any other creature, you must return it.
//   Stonecloaker's first triggered ability doesn't target any creature. Because of this, no player may take actions between the time you choose the creature to return and the time you return it.

export default defineCard({
  name: "Stonecloaker",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nWhen this creature enters, return a creature you control to its owner's hand.\nWhen this creature enters, exile target card from a graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a creature you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a creature you control to its owner's hand.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature enters, exile target card from a graveyard.",
    },
  ],
});
