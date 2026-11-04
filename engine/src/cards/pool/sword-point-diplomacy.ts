import { defineCard } from "../define.js";

// Rulings:
//   [2017-09-29] You reveal all three cards before opponents choose whether to pay life for any of
//     them.
//   [2017-09-29] In a multiplayer game, each opponent in turn order chooses whether to pay life for
//     one card before proceeding to the next card. You choose the order to perform this process for
//     the cards, but opponents may discuss them before making any choices. Opponents will then know
//     choices made by earlier opponents when making their choices.

export default defineCard({
  name: "Sword-Point Diplomacy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Reveal the top three cards of your library. For each of those cards, put that card into your hand unless any opponent pays 3 life. Then exile the rest.",
  effect: {
    kind: "for-each-unless",
    of: { libraryTop: 3 },
    asks: { anyOf: "each-opponent" },
    inOrderYouChoose: true,
    options: [{ payLife: 3, text: "Pay 3 life to keep {it} from their hand" }],
    otherwise: { kind: "return-to-hand", target: 0, from: "library" },
    rest: "exile",
  },
});
