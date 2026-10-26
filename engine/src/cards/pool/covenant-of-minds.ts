import { defineCard } from "../define.js";

// EDHREC rank 20687. Shards of Alara. The three cards are revealed to every
// player first (a look-and-choose that takes none and leaves them on top),
// then the targeted opponent chooses. The ruling: the first option *puts*
// the cards into your hand (not a draw); the second puts them into your
// graveyard (not a mill) and you draw five.
export default defineCard({
  name: "Covenant of Minds",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal the top three cards of your library. Target opponent may choose to put those cards into your hand. If they don't, put those cards into your graveyard and draw five cards.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 3, reveal: true, min: 0, max: 0, destination: "hand", leftover: "stay" },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          {
            text: "Put those cards into their hand.",
            effect: { kind: "look-and-choose", zone: "library", count: 3, min: 0, max: 0, destination: "hand", leftover: "hand" },
          },
          {
            text: "Put those cards into their graveyard, and they draw five cards.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "look-and-choose", zone: "library", count: 3, min: 0, max: 0, destination: "hand", leftover: "graveyard" },
                { kind: "draw", amount: 5 },
              ],
            },
          },
        ],
      },
    ],
  },
});
