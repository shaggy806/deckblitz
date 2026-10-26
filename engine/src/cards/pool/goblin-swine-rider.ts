import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 29066. Every attacking and every blocking
// creature as the trigger resolves — itself included, and each one once even
// if it were somehow both — dealt 2 by this creature (as it last existed, if
// it has left).
const BLOCKED_TEXT =
  "Whenever this creature becomes blocked, it deals 2 damage to each attacking creature and each blocking creature.";

export default defineCard({
  name: "Goblin Swine-Rider",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: BLOCKED_TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        amount: 2,
        filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] },
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
});
