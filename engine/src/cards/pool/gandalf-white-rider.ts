import { defineCard } from "../define.js";

// EDHREC rank 9956.
//
// Rulings:
//   [2023-06-16] If Gandalf, White Rider's owner has three or fewer cards left in their library
//     when the last ability resolves, you may have it become the bottom card of their library.

export default defineCard({
  name: "Gandalf, White Rider",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever you cast a spell, creatures you control get +1/+0 until end of turn. Scry 1.\nWhen Gandalf dies, you may put it into its owner's library fifth from the top.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you cast a spell, creatures you control get +1/+0 until end of turn. Scry 1.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Fifth from the top, or the bottom of a library of three or fewer
      // (the ruling — `fromTop`); only from the graveyard it went to.
      effect: {
        kind: "may",
        prompt: "Put Gandalf into its owner's library fifth from the top?",
        effect: { kind: "put-on-library", target: "trigger-object", position: { fromTop: 5 } },
      },
      resolve: null,
      text: "When Gandalf dies, you may put it into its owner's library fifth from the top.",
    },
  ],
});
