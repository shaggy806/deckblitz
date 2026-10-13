import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 6977.
//
// Mangara, the Diplomat's attack trigger: the count is an intervening if in
// the present tense, asked again as it resolves (`stillAttacking`). "That
// opponent" is the attacking player — the active player, the only one who
// declares attackers (rule 506.2).
const ATTACK_TEXT =
  "Whenever an opponent attacks with creatures, if two or more of those creatures are attacking you and/or planeswalkers you control, that opponent loses 3 life and you draw a card.";

export default defineCard({
  name: "Tomik, Wielder of Law",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text:
    "Affinity for planeswalkers (This spell costs {1} less to cast for each planeswalker you control.)\nFlying, vigilance\n" +
    ATTACK_TEXT,
  selfCostReduction: affinity({ type: "planeswalker" }),
  triggered: [
    {
      trigger: { on: "attack-with", who: "opponent", atLeast: 2, attackingYou: true, stillAttacking: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "active-player", amount: 3 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
