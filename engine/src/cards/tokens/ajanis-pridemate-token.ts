import { defineCard } from "../define.js";

/**
 * Ajani Resolute's token: a 2/2 white Cat Soldier *named* Ajani's Pridemate.
 * "Ajani's Pridemate" is already the real card (whose {1}{W} mana cost a
 * token mustn't have — the ruling), so it's keyed " Token" and named by
 * `tokenName`.
 */
export default defineCard({
  name: "Ajani's Pridemate Token",
  tokenName: "Ajani's Pridemate",
  art: "7801c326-d740-4cec-9268-05348ace8302",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever you gain life, put a +1/+1 counter on this token.",
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever you gain life, put a +1/+1 counter on this token.",
    },
  ],
});
