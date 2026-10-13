import { defineCard } from "../define.js";

// EDHREC rank 7093.
//
// Dreadmaw's Ire's granted combat-damage trigger: the creature's own ability
// once granted, so its controller creates the Treasure.
const GRANT_TEXT =
  '{1}, {T}: Until end of turn, target creature gains "Whenever this creature deals combat damage to a player, create a Treasure token."';

export default defineCard({
  name: "Dragon-Cursed Halls",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${GRANT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "create-token", token: "Treasure Token", count: 1 },
          resolve: null,
          text: "Whenever this creature deals combat damage to a player, create a Treasure token.",
        },
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
