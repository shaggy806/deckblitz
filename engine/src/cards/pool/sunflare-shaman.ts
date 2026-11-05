import { defineCard } from "../define.js";

// Both damages as one event; X counts the Elemental cards in your graveyard
// as it resolves, this one included if it's there by then (the rulings).

const ELEMENTALS = { countInGraveyard: { subtype: "Elemental", ownedBy: "you" } } as const;
const TEXT =
  "{1}{R}, {T}: This creature deals X damage to any target and X damage to itself, where X is the number of Elemental cards in your graveyard.";

export default defineCard({
  name: "Sunflare Shaman",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: ELEMENTALS, target: 0 },
          { kind: "damage", amount: ELEMENTALS, target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
