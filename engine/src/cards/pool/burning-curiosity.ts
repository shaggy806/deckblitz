import { defineCard } from "../define.js";

// "You may blight 1" is an optional additional cost (rule 601.2b), a kicker
// by another name: paying it is the kicked cast, offered only with a creature
// to blight (701.68b), and "if this spell's additional cost was paid" is the
// kicked effect.
export default defineCard({
  name: "Burning Curiosity",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, you may blight 1. (You may put a -1/-1 counter on a creature you control.)\nExile the top two cards of your library. If this spell's additional cost was paid, exile the top three cards instead. Until the end of your next turn, you may play those cards.",
  kicker: {
    cost: "",
    keyword: "blight",
    blight: 1,
    effect: { kind: "impulse-exile", amount: 3, duration: "your-next-turn" },
  },
  effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
});
