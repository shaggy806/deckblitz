import { defineCard } from "../define.js";

// EDHREC rank 7874. Twiddle's tap-or-untap choice behind a discard cost.

const TEXT = "Discard a card: You may tap or untap target artifact, creature, or land.";

export default defineCard({
  name: "Mind Over Matter",
  manaCost: "{2}{U}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it.", effect: { kind: "tap", target: 0 } },
          { text: "Untap it.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
