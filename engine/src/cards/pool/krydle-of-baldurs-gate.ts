import { defineCard } from "../define.js";

// EDHREC rank 8104. "That player" is the player Krydle dealt combat damage to
// (`trigger-player`). The attack trigger's "If you do" (not "When you do")
// means its target is chosen as it's put on the stack, before paying.
const DAMAGE_TEXT =
  "Whenever Krydle deals combat damage to a player, that player loses 1 life and mills a card, then you gain 1 life and scry 1.";
const ATTACK_TEXT = "Whenever you attack, you may pay {2}. If you do, target creature can't be blocked this turn.";

export default defineCard({
  name: "Krydle of Baldur's Gate",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Rogue"],
  power: 1,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "trigger-player" },
          { kind: "mill", target: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {2} to make target creature unblockable this turn?",
        cost: "{2}",
        effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
