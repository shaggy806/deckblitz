import { defineCard } from "../define.js";

// EDHREC rank 27583.
//
// Expensive Taste's face-down impulse exile (only you may look at them, for as
// long as they're exiled), playable until your next turn; then Grinning
// Totem's delayed trigger about the cards exiled this way. A card played has
// left exile, a new object (rule 400.7), so "any of those cards you didn't
// play" are the ones still the objects exiled, and `put-into-graveyard` acts
// only on those.
const TEXT =
  "Exile the top three cards of your library face down. You may look at those cards for as long as they remain exiled. Until your next turn, you may play those cards. At the beginning of your next upkeep, put any of those cards you didn't play into your graveyard.";

export default defineCard({
  name: "Three Wishes",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "impulse-exile", amount: 3, duration: "until-your-next-turn", faceDown: true, play: true },
      {
        kind: "delayed-trigger",
        at: { step: "upkeep", whose: "you" },
        about: "exiled",
        effect: { kind: "for-each-target", from: 0, effect: { kind: "put-into-graveyard", target: 0 } },
        text: "At the beginning of your next upkeep, put any of those cards you didn't play into your graveyard.",
      },
    ],
  },
});
