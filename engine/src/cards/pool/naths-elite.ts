import { defineCard } from "../define.js";

export default defineCard({
  name: "Nath's Elite",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 2,
  text: "All creatures able to block this creature do so.\nWhen this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "clash", won: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
      resolve: null,
      text: "When this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
