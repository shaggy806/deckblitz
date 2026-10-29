import { defineCard } from "../define.js";

/**
 * Tatsunari, Toad Rider's token: "Keimi, a legendary 3/3 black and green Frog
 * creature token with 'Whenever you cast an enchantment spell, each opponent
 * loses 1 life and you gain 1 life.'" A named legendary token (Darkstar's
 * shape), so the legend rule (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Keimi",
  art: "fbb5b3f9-0012-4deb-b795-c377cdfe546b",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 3,
  toughness: 3,
  text: "Whenever you cast an enchantment spell, each opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you cast an enchantment spell, each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
