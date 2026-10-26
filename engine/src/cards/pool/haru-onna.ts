import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 19888.
const ENTER_TEXT = "When this creature enters, draw a card.";
const BOUNCE_TEXT = "Whenever you cast a Spirit or Arcane spell, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Haru-Onna",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${BOUNCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Haru-Onna to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
