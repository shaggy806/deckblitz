import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). One shield of 1 for each creature and each
// player, each its own (rule 615.7); a prevention effect modifies the rules,
// so a creature that arrives later this turn gets one too (rule 611.2c).

const TEXT = "{T}: Prevent the next 1 damage that would be dealt to each creature and each player this turn.";

export default defineCard({
  name: "Kitsune Palliator",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "damage-rule",
        to: { players: "each", permanents: { type: "creature" } },
        amount: 1,
        eachRecipient: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
