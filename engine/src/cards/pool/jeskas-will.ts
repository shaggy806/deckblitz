import { defineCard } from "../define.js";

// EDHREC rank 106.
// Both modes once you control any commander as you cast it — whoever's it is, and whatever happens
// to it after (the rulings). The {R} counts the target opponent's hand as it resolves; what's
// exiled and not played stays exiled.

export default defineCard({
  name: "Jeska's Will",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Add {R} for each card in target opponent's hand.\n• Exile the top three cards of your library. You may play them this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Add {R} for each card in target opponent's hand.",
        targets: ["opponent"],
        effect: { kind: "add-mana", mana: "R", amount: { cardsInHand: { target: 0 } } },
      },
      {
        text: "Exile the top three cards of your library. You may play them this turn.",
        targets: [],
        effect: { kind: "impulse-exile", amount: 3, duration: "end-of-turn" },
      },
    ],
  },
});
