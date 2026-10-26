import { defineCard } from "../define.js";

const TEXT =
  "When this creature is put into your graveyard from the battlefield, at the beginning of the next end step, you lose 1 life and return this card to your hand.";

export default defineCard({
  name: "Brood of Cockroaches",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      // One effect at the end step (the ruling): the life loss isn't optional.
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", amount: 1 },
            { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
          ],
        },
        text: "You lose 1 life and return this card to your hand.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
