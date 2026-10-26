import { defineCard } from "../define.js";

// EDHREC rank 10441.

const TEXT =
  "Whenever a creature you control deals combat damage to a player, add that much {G}. Until end of turn, you don't lose this mana as steps and phases end.";

// Old Gnawbone's trigger (its value is the damage dealt) with Raphael, Ninja
// Destroyer's persisting mana.
export default defineCard({
  name: "Sakiko, Mother of Summer",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: { triggerValue: true }, persists: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
