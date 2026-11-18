import { defineCard } from "../define.js";

// New Phyrexia. EDHREC rank 14374.
//
// Rulings:
//   In most cases, Green Sun's Zenith instructs you to shuffle your library twice. Although
//     shuffling that library only once is an acceptable shortcut, Psychic Surgery's ability will
//     still trigger twice.
//   You look at the top two cards of that library as the triggered ability resolves. That happens
//     after your opponent is done shuffling.
//   If your opponent's library has one card in it and they are instructed to shuffle that library,
//     Psychic Surgery will trigger. You may exile the one card in that library.
//
// "Whenever an opponent shuffles their library" is the `shuffles-library`
// trigger event; "that library" is the trigger player's.

const TEXT =
  "Whenever an opponent shuffles their library, you may look at the top two cards of that library. You may exile one of those cards. Then put the rest on top of that library in any order.";

export default defineCard({
  name: "Psychic Surgery",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "shuffles-library", who: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at the top two cards of that library?",
        effect: {
          kind: "look-and-choose",
          from: "trigger-player",
          zone: "library",
          count: 2,
          min: 0,
          max: 1,
          destination: "exile",
          leftover: "top-any-order",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
