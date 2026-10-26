import { defineCard } from "../define.js";

// One trigger per attacked player (`attacks-player`, off the attack
// declaration); the attacking player is the active player, asked with
// `each-player-may` so the token is theirs. A creature attacking a
// planeswalker of the enchanted player attacks no player (the ruling).
const ATTACK_TEXT =
  "Whenever a player attacks enchanted player with one or more creatures, that attacking player may create a tapped 2/2 black Zombie creature token.";

export default defineCard({
  name: "Curse of Shallow Graves",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${ATTACK_TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "attached" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        prompt: "Create a tapped 2/2 black Zombie creature token?",
        effect: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
