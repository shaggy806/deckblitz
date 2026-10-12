import { defineCard } from "../define.js";

// EDHREC rank 19774.
//
// "Behold a Kithkin or pay {2}": a choice of whole costs (rule 601.2b),
// beholding offered only with a Kithkin to reveal from the hand or choose on
// the battlefield (701.4a).

export default defineCard({
  name: "Kinsbaile Aspirant",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Citizen"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      {
        text: "Behold a Kithkin",
        behold: { filter: { subtype: "Kithkin" }, text: "a Kithkin" },
      },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: "As an additional cost to cast this spell, behold a Kithkin or pay {2}. (To behold a Kithkin, choose a Kithkin you control or reveal a Kithkin card from your hand.)\nWhenever another creature you control enters, this creature gets +1/+1 until end of turn.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another creature you control enters, this creature gets +1/+1 until end of turn.",
    },
  ],
});
