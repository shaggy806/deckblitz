import { defineCard } from "../define.js";

// EDHREC rank 16590.

// "Each other player" is each opponent of the activating player; each one
// chooses what they sacrifice.
export default defineCard({
  name: "Shattergang Brothers",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 3,
  toughness: 3,
  text: "{2}{B}, Sacrifice a creature: Each other player sacrifices a creature.\n{2}{R}, Sacrifice an artifact: Each other player sacrifices an artifact.\n{2}{G}, Sacrifice an enchantment: Each other player sacrifices an enchantment.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "{2}{B}, Sacrifice a creature: Each other player sacrifices a creature.",
    },
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "artifact" }, count: 1 },
      resolve: null,
      text: "{2}{R}, Sacrifice an artifact: Each other player sacrifices an artifact.",
    },
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: { filter: { type: "enchantment" } } },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "enchantment" }, count: 1 },
      resolve: null,
      text: "{2}{G}, Sacrifice an enchantment: Each other player sacrifices an enchantment.",
    },
  ],
});
