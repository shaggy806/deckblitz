import { defineCard } from "../define.js";

// EDHREC rank 13383. The token is "you"'s, not the copied creature's
// controller's (a defending player who enchanted the attacker may block with
// it — the ruling), and it isn't attacking. The copy is of the attacker that
// fired the trigger, whatever has happened to this Aura since.
const ATTACK_TEXT =
  "Whenever enchanted creature attacks, you may create a token that's a copy of that creature. Exile that token at end of combat.";

export default defineCard({
  name: "Mirror Mockery",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a token that's a copy of the enchanted creature?",
        effect: { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you", exileAtEndOfCombat: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
