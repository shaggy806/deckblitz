import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 24377.
//
// Truce's shape: each other player, in turn order, may draw; one who does
// picks three, two or one card (the `modal` is that player's own effect).
// Declining is drawing none.

const TEXT = "When this creature enters, each other player may draw up to three cards.";

export default defineCard({
  name: "Indentured Djinn",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Draw up to three cards?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Draw three cards.", effect: { kind: "draw", amount: 3 } },
            { text: "Draw two cards.", effect: { kind: "draw", amount: 2 } },
            { text: "Draw one card.", effect: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
