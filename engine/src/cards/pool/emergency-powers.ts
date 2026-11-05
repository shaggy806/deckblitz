import { defineCard } from "../define.js";

// A copy wasn't cast, so it gets no addendum (the ruling). {X} in a card in hand
// is 0 (the ruling), which is its mana value there.
export default defineCard({
  name: "Emergency Powers",
  manaCost: "{5}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  exileOnResolve: true,
  text: "Each player shuffles their hand and graveyard into their library, then draws seven cards. Exile Emergency Powers.\nAddendum — If you cast this spell during your main phase, you may put a permanent card with mana value 7 or less from your hand onto the battlefield.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
      { kind: "draw", amount: 7, who: "each-player" },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 1,
          filter: {
            typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
            manaValue: { op: "lte", n: 7 },
          },
          destination: "battlefield",
          leftover: "stay",
        },
      },
    ],
  },
});
