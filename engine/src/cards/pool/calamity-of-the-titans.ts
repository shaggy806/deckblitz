import { defineCard } from "../define.js";

// EDHREC rank 4589. The colorless creature card stays revealed while the
// spell is on the stack and needn't still be in the hand as it resolves: its
// mana value is then as it last existed there (the rulings —
// `{ manaValueOf: "revealed" }`).

const COST = "As an additional cost to cast this spell, reveal a colorless creature card from your hand.";
const TEXT = "Exile each creature and planeswalker with mana value less than the revealed card's mana value.";

export default defineCard({
  name: "Calamity of the Titans",
  manaCost: "{4}{C}{C}",
  colors: [],
  types: ["sorcery"],
  text: `${COST}\n${TEXT}`,
  additionalCost: {
    behold: { filter: { type: "creature", colorless: true }, text: "a colorless creature card", fromHand: true },
  },
  effect: {
    kind: "exile-all",
    filter: {
      typesAnyOf: ["creature", "planeswalker"],
      manaValue: { op: "lt", n: { amount: { manaValueOf: "revealed" } } },
    },
  },
});
