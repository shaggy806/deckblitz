import { defineCard } from "../define.js";

const TEXT =
  "{1}{W}{W}, {T}, Discard a card: The next time a source of your choice would deal damage to you this turn, prevent that damage. You gain life equal to the damage prevented this way.";

export default defineCard({
  name: "Cho-Arrim Alchemist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        to: "you",
        amount: "next-time",
        gainLifePrevented: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
