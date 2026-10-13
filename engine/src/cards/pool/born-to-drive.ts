import { defineCard } from "../define.js";

// EDHREC rank 10858.
//
// Rulings:
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//
// The bonus is gated on the enchanted permanent being a creature now (a
// crewed Vehicle is one), and counts each permanent that's a creature and/or
// a Vehicle once. Channel (rule 702.51a) is a hand ability that discards the
// card as its cost.
const ANTHEM_TEXT =
  "As long as enchanted permanent is a creature, it gets +1/+1 for each creature and/or Vehicle you control.";
const CHANNEL_TEXT =
  'Channel — {2}{W}, Discard this card: Create two 1/1 colorless Pilot creature tokens with "This token crews Vehicles as though its power were 2 greater."';

export default defineCard({
  name: "Born to Drive",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${ANTHEM_TEXT}\n${CHANNEL_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      grantPtPerCount: {
        filter: { controlledBy: "you", anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
        pt: [1, 1],
      },
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      zone: "hand",
      targets: [],
      effect: { kind: "create-token", token: "Pilot Token (Crews Vehicles)", count: 2 },
      resolve: null,
      text: CHANNEL_TEXT,
    },
  ],
});
