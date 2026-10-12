import { defineCard } from "../define.js";

// EDHREC rank 4014.
//
// "Behold an Elf and exile it" is a mandatory additional cost (rule 701.4a):
// an Elf card from the hand or an Elf you control, exiled as the spell is
// cast. The exiled card is linked to the permanent the spell becomes (rule
// 607.2q), so it stays exiled for good if the spell is countered (the
// ruling), and a token exiled this way ceases to exist (111.7).

export default defineCard({
  name: "Champions of the Perfect",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 6,
  toughness: 6,
  additionalCost: { behold: { filter: { subtype: "Elf" }, text: "an Elf", exile: true } },
  text: "As an additional cost to cast this spell, behold an Elf and exile it. (Exile an Elf you control or an Elf card from your hand.)\nWhenever you cast a creature spell, draw a card.\nWhen this creature leaves the battlefield, return the exiled card to its owner's hand.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you cast a creature spell, draw a card.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card to its owner's hand.",
    },
  ],
});
