import { defineCard } from "../define.js";

// An untargeted shield on its controller against combat damage only (rule
// 615.7): a `damage-rule` to "you" with an amount and `combat`.
const TEXT = "{1}{W}: Prevent the next 1 combat damage that would be dealt to you this turn.";

export default defineCard({
  name: "Decorated Griffin",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 1, combat: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
