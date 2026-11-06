import { defineCard } from "../define.js";

// EDHREC rank 31297.

export default defineCard({
  name: "Tell Me What You See",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, target opponent may have you draw a card. If they don't, they lose 4 life and you surveil 1.\nWhenever you face a dilemma, you may return this enchantment to its owner's hand. (You face a dilemma as you choose one or more modes for a spell or ability.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // Terrapact Intimidator's shape: the opponent picks, the effects are yours.
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          { text: "Have them draw a card.", effect: { kind: "draw", amount: 1 } },
          {
            text: "You lose 4 life and they surveil 1.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 4, target: 0 },
                { kind: "surveil", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "When this enchantment enters, target opponent may have you draw a card. If they don't, they lose 4 life and you surveil 1.",
    },
    {
      trigger: { on: "faces-dilemma", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Tell Me What You See to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: "Whenever you face a dilemma, you may return this enchantment to its owner's hand.",
    },
  ],
});
