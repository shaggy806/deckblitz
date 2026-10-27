import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 24743.

const TEXT = "{X}{B}, {T}, Discard two cards: Target player discards X cards at random.";

export default defineCard({
  name: "Greel, Mind Raker",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{B}", tap: true, discard: { count: 2 } },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: "x", random: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
