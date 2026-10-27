import { defineCard } from "../define.js";

// EDHREC rank 16996. A Spellshaper: Darkness's effect
// behind a discard cost.

const TEXT = "{G}, {T}, Discard a card: Prevent all combat damage that would be dealt this turn.";

export default defineCard({
  name: "Dawnstrider",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: [],
      resolve: null,
      effect: { kind: "prevent-all-combat-damage" },
      text: TEXT,
    },
  ],
});
