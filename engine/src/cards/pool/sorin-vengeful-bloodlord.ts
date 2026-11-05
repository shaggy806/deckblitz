import { defineCard } from "../define.js";

export default defineCard({
  name: "Sorin, Vengeful Bloodlord",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 4,
  text: "During your turn, creatures and planeswalkers you control have lifelink.\n+2: Sorin deals 1 damage to target player or planeswalker.\n−X: Return target creature card with mana value X from your graveyard to the battlefield. That creature is a Vampire in addition to its other types.",
  static: [
    {
      affects: { scope: "filter", filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "you" } },
      condition: { kind: "your-turn" },
      grantKeywords: ["lifelink"],
      text: "During your turn, creatures and planeswalkers you control have lifelink.",
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "+2: Sorin deals 1 damage to target player or planeswalker.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, addSubtypes: ["Vampire"] },
      resolve: null,
      text: "−X: Return target creature card with mana value X from your graveyard to the battlefield. That creature is a Vampire in addition to its other types.",
    },
  ],
});
