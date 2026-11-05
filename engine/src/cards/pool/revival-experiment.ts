import { defineCard } from "../define.js";

// Up to one card a permanent type, returned together (`oneEach`), a card of
// several types filling any one slot it fits; 3 life for each that entered.

const PERMANENT_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] as const;

export default defineCard({
  name: "Revival Experiment",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "For each permanent type, return up to one card of that type from your graveyard to the battlefield. You lose 3 life for each card returned this way. Exile Revival Experiment.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: PERMANENT_TYPES.length,
        together: {
          oneEach: PERMANENT_TYPES.map((type) => ({
            label: `${/^[aeiou]/.test(type) ? "an" : "a"} ${type} card`,
            filter: { type },
          })),
          text: "up to one card of each permanent type",
        },
        destination: "battlefield",
        leftover: "stay",
      },
      { kind: "lose-life", amount: { product: [{ thisWay: "put-onto-battlefield" }, 3] } },
    ],
  },
  exileOnResolve: true,
});
