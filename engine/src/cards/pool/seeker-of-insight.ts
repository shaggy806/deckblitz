import { defineCard } from "../define.js";

const LOOT_TEXT =
  "{T}: Draw a card, then discard a card. Activate only if you've cast a noncreature spell this turn.";

export default defineCard({
  name: "Seeker of Insight",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: LOOT_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      // Cast, not resolved: a countered or still-pending spell counts (the ruling).
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
