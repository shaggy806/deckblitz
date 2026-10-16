import { defineCard } from "../define.js";

// EDHREC rank 12458.
// The sacrifice trigger fires once per permanent sacrificed, this one
// included, and a sacrifice paid as a cost resolves before the spell or
// ability it paid for (the rulings).
const SAC =
  '{1}{B}, Sacrifice another creature or enchantment: This creature gains indestructible until end of turn. Tap it. (Damage and effects that say "destroy" don\'t destroy it.)';
const DRAIN = "Whenever you sacrifice a permanent, target opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Popular Egotist",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: `${SAC}\n${DRAIN}`,
  activated: [
    {
      cost: {
        mana: "{1}{B}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "enchantment"] } },
      },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
  ],
});
