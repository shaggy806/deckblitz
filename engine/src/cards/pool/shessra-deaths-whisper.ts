import { defineCard } from "../define.js";

// EDHREC rank 17344.
// Liliana's Devotee's end-step intervening-if, with a life payment.

const WHISPERS = "Bewitching Whispers — When Shessra enters, target creature blocks this turn if able.";
const GRAVE =
  "Whispers of the Grave — At the beginning of your end step, if a creature died this turn, you may pay 2 life. If you do, draw a card.";

export default defineCard({
  name: "Shessra, Death's Whisper",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Warlock"],
  power: 1,
  toughness: 3,
  text: `${WHISPERS}\n${GRAVE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0 },
      resolve: null,
      text: WHISPERS,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 2 life to draw a card?",
        costLife: 2,
        effect: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: GRAVE,
    },
  ],
});
