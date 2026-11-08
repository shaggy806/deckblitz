import { defineCard } from "../define.js";

// EDHREC rank 11335.

export default defineCard({
  name: "Walker of Secret Ways",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 1,
  toughness: 2,
  text: "Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever this creature deals combat damage to a player, look at that player's hand.\n{1}{U}: Return target Ninja you control to its owner's hand. Activate only during your turn.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Ninja" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{1}{U}: Return target Ninja you control to its owner's hand. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "look-at-hand", target: "trigger-player" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, look at that player's hand.",
    },
  ],
});
