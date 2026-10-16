import { defineCard } from "../define.js";

// EDHREC rank 22041.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you gain 1 life and surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const DISGUISE =
  "Disguise {4}{B} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";

export default defineCard({
  name: "Basilica Stalker",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Detective"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\n${DISGUISE}`,
  morph: { keyword: "disguise", cost: "{4}{B}" },
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 1 },
          { kind: "surveil", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
