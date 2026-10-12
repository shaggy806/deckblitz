import { defineCard } from "../define.js";

// EDHREC rank 12459.
//
// "Behold an Elf or pay {2}": a choice of whole costs (rule 601.2b),
// beholding offered only with an Elf to reveal from the hand or choose on the
// battlefield (701.4a). The mana ability's "activate only if" is Tainted
// Field's condition, over the graveyard.

const MANA_TEXT = "{T}: Add {G}{G}. Activate only if there is an Elf card in your graveyard.";

export default defineCard({
  name: "Lys Alana Dignitary",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 2,
  toughness: 3,
  additionalCost: {
    options: [
      { text: "Behold an Elf", behold: { filter: { subtype: "Elf" }, text: "an Elf" } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: `As an additional cost to cast this spell, behold an Elf or pay {2}. (To behold an Elf, choose an Elf you control or reveal an Elf card from your hand.)\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Elf" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
