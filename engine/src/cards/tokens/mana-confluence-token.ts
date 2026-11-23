import { defineCard } from "../define.js";

/**
 * A token that's a copy of the card Mana Confluence (Dwarven Confluencer's
 * ruling): a land named Mana Confluence with no mana cost. "Mana Confluence"
 * is already the real card, so it's keyed " Token" and named by `tokenName`.
 */
export default defineCard({
  name: "Mana Confluence Token",
  tokenName: "Mana Confluence",
  // A copy of the card, so the card's own art (Dwarven Confluencer, a
  // playtest card, lists no token printing).
  art: "504a69eb-3c2d-4bb1-b117-252b15acf0c2",
  colors: [],
  types: ["land"],
  text: "{T}, Pay 1 life: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Pay 1 life: Add one mana of any color.",
    },
  ],
});
