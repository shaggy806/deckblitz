import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 13456. Smash to Smithereens' shape; the
// mana value and the controller are read as the artifact last existed
// (rule 608.2h), so the damage follows even once it's destroyed — and an
// indestructible artifact that survives still has its controller dealt it.

const TEXT =
  "{1}{R}, {T}: Destroy target artifact. This creature deals damage to that artifact's controller equal to the artifact's mana value.";

export default defineCard({
  name: "Viashino Heretic",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
