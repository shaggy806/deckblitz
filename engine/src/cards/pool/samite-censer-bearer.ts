import { defineCard } from "../define.js";

// Time Spiral (TSP). One shield of 1 for each creature you control, each its
// own (rule 615.7), read as the damage would be dealt (rule 611.2c).

const TEXT = "{W}, Sacrifice this creature: Prevent the next 1 damage that would be dealt to each creature you control this turn.";

export default defineCard({
  name: "Samite Censer-Bearer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "damage-rule",
        to: { permanents: { type: "creature", controlledBy: "you" } },
        amount: 1,
        eachRecipient: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
