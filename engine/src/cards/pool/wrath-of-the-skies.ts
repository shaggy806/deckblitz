import { defineCard } from "../define.js";

// Modern Horizons 3. "You get X {E}" is the spell's X; the X the destroy
// reads is the energy paid (`costEnergyX: "any"`), which can be more or less
// than it — energy from before counts. Paying none is paying 0: what has mana
// value 0 (a token, say) is still destroyed.
export default defineCard({
  name: "Wrath of the Skies",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You get X {E} (energy counters), then you may pay any amount of {E}. Destroy each artifact, creature, and enchantment with mana value less than or equal to the amount of {E} paid this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: "x" },
      {
        kind: "may",
        prompt: "Pay any amount of {E}? Each artifact, creature, and enchantment with mana value up to the amount paid is destroyed.",
        costEnergyX: "any",
        effect: {
          kind: "destroy-all",
          filter: { typesAnyOf: ["artifact", "creature", "enchantment"], manaValue: { op: "lte", n: "x" } },
        },
      },
    ],
  },
});
