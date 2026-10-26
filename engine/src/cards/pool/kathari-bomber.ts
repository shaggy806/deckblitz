import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 25469.
//
// Rulings:
//   [2017-03-14] When Kathari Bomber's triggered ability resolves, you create two Goblin tokens
//     regardless of how much combat damage Kathari Bomber dealt to the player. You create the
//     tokens even if you can't sacrifice Kathari Bomber.
const DAMAGE_TEXT =
  "When this creature deals combat damage to a player, create two 1/1 red Goblin creature tokens and sacrifice this creature.";

export default defineCard({
  name: "Kathari Bomber",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Bird", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\nUnearth {3}{B}{R} ({3}{B}{R}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [unearth("{3}{B}{R}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Goblin Token", count: 2 },
          { kind: "sacrifice-source" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
