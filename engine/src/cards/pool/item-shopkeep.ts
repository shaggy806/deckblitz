import { defineCard } from "../define.js";

// EDHREC rank 13608.
// Rulings:
//   [2025-06-06] If the target creature isn't both attacking and equipped when Item Shopkeep's
//     ability tries to resolve, it won't resolve and none of its effects will happen. However, in
//     cases where it does resolve, it doesn't matter what happens to any of the Equipment on that
//     creature. It'll still have menace even if it stops being equipped.

const ATTACK_TEXT = "Whenever you attack, target attacking equipped creature gains menace until end of turn.";

export default defineCard({
  name: "Item Shopkeep",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      // Rechecked as it resolves (rule 608.2b — the ruling); once it has,
      // the menace stays whatever happens to the Equipment.
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, equipped: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
