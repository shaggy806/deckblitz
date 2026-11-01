import { defineCard } from "../define.js";

// EDHREC rank 31114. The reveal is a mandatory additional cost, its card
// chosen as the cost is paid; its mana value is read in the hand, or as it
// last existed there once it has left (`{ manaValueOf: "revealed" }`).

const COST = "As an additional cost to cast this spell, reveal a creature card from your hand.";
const TEXT = "You gain life equal to the revealed card's mana value.";

export default defineCard({
  name: "Living Destiny",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `${COST}\n${TEXT}`,
  additionalCost: { behold: { filter: { type: "creature" }, text: "a creature card", fromHand: true } },
  effect: { kind: "gain-life", amount: { manaValueOf: "revealed" } },
});
