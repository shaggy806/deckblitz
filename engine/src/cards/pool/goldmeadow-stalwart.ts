import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 25028.
//
// "Reveal a Kithkin card from your hand or pay {3}": a choice of whole
// additional costs (rule 601.2b), the reveal offered only with another
// Kithkin card in hand (the spell is on the stack by then, 601.2a) and
// chosen as the cost is paid (601.2h). The card stays in hand, revealed
// (701.20a).

export default defineCard({
  name: "Goldmeadow Stalwart",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  additionalCost: {
    options: [
      { text: "Reveal a Kithkin card", behold: { filter: { subtype: "Kithkin" }, text: "a Kithkin card", fromHand: true } },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  text: "As an additional cost to cast this spell, reveal a Kithkin card from your hand or pay {3}.",
});
