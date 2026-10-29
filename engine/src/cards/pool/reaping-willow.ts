import { defineCard } from "../define.js";

// EDHREC rank 14471.
//
// Rulings:
//   - If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// "Remove two counters": of any kinds, the player choosing which.

const RETURN_TEXT =
  "{1}{W/B}, Remove two counters from this creature: Return target creature card with mana value 3 or less from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Reaping Willow",
  manaCost: "{1}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Cleric"],
  power: 3,
  toughness: 6,
  keywords: ["lifelink"],
  text: `Lifelink\nThis creature enters with two -1/-1 counters on it.\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W/B}", tap: false, removeCounter: { kind: "any", count: 2 } },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
