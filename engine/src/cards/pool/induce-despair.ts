import { defineCard } from "../define.js";

// EDHREC rank 28549. The reveal is a mandatory additional cost (rule
// 601.2b), its card chosen as the cost is paid (`behold` with `fromHand`);
// "the revealed card's mana value" reads it in the hand, or as it last
// existed there once it has left (`{ manaValueOf: { paid: "revealed" } }`).

const COST = "As an additional cost to cast this spell, reveal a creature card from your hand.";
const TEXT = "Target creature gets -X/-X until end of turn, where X is the revealed card's mana value.";

export default defineCard({
  name: "Induce Despair",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `${COST}\n${TEXT}`,
  additionalCost: { behold: { filter: { type: "creature" }, text: "a creature card", fromHand: true } },
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { product: [{ manaValueOf: { paid: "revealed" } }, -1] },
    toughness: { product: [{ manaValueOf: { paid: "revealed" } }, -1] },
    duration: "end-of-turn",
  },
});
