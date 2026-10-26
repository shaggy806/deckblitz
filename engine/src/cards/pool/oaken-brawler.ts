import { defineCard } from "../define.js";

export default defineCard({
  name: "Oaken Brawler",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 2,
  toughness: 4,
  text: "When this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "clash", won: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
      resolve: null,
      text: "When this creature enters, clash with an opponent. If you win, put a +1/+1 counter on this creature.",
    },
  ],
});
