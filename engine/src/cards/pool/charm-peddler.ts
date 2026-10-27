import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28542. Samite Blessing's prevention
// shield behind a Spellshaper's cost.

const TEXT =
  "{W}, {T}, Discard a card: The next time a source of your choice would deal damage to target creature this turn, prevent that damage.";

export default defineCard({
  name: "Charm Peddler",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time" },
      resolve: null,
      text: TEXT,
    },
  ],
});
