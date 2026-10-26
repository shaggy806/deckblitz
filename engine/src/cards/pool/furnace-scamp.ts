import { defineCard } from "../define.js";

// EDHREC rank 27094.
//
// The 3 damage comes from the sacrificed Scamp as it last existed (rule 608.2h), to the
// player it dealt combat damage to (`"trigger-player"`).

const TEXT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, this creature deals 3 damage to that player.";

export default defineCard({
  name: "Furnace Scamp",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Furnace Scamp to deal 3 damage to that player?",
        effect: { kind: "sacrifice-source", then: { kind: "damage", amount: 3, who: "trigger-player" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
