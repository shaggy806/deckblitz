import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, mill a card. Then if there are three or more creature cards in your graveyard, transform this creature.";

export default defineCard({
  name: "Deathbonnet Sprout",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (To mill a card, put the top card of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // "Then if" is checked after the mill, as it resolves — not an
      // intervening-if.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature" } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Deathbonnet Sprout", "Deathbonnet Hulk"],
  transform: true,
});
