import { defineCard } from "../define.js";

const TEXT = "If you would draw a card, exile the top two cards of your library instead. You may play those cards this turn.";

export default defineCard({
  name: "Eruth, Tormented Prophet",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: { effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn", play: true } },
      },
      text: TEXT,
    },
  ],
});
