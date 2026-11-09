import { defineCard } from "../define.js";

// The exiled card is the drawing player's own, so "they" may play it is its
// owner's permission; it lasts this turn and only while the Mask stays (it's
// an ability of the Mask). Cards not played just stay exiled (the ruling).
const REPLACE_TEXT = "If a player would draw a card, that player exiles that card face up instead.";
const PLAY_TEXT = "Each player may play lands and cast spells from among cards they exiled with this artifact this turn.";

export default defineCard({
  name: "Uba Mask",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${REPLACE_TEXT}\n${PLAY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "any-player",
        instead: {
          effect: {
            kind: "impulse-exile",
            amount: 1,
            whose: "trigger-player",
            duration: "end-of-turn",
            play: true,
            byOwner: true,
            whileSource: true,
          },
        },
      },
      text: `${REPLACE_TEXT} ${PLAY_TEXT}`,
    },
  ],
});
