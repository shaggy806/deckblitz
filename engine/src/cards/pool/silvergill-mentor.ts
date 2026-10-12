import { defineCard } from "../define.js";

// EDHREC rank 16200.
//
// "Behold a Merfolk or pay {2}": a choice of whole costs (rule 601.2b),
// beholding offered only with a Merfolk to reveal from the hand or choose on
// the battlefield (701.4a).

const ENTER_TEXT = "When this creature enters, create a 1/1 white and blue Merfolk creature token.";

export default defineCard({
  name: "Silvergill Mentor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      { text: "Behold a Merfolk", behold: { filter: { subtype: "Merfolk" }, text: "a Merfolk" } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  text: `As an additional cost to cast this spell, behold a Merfolk or pay {2}. (To behold a Merfolk, choose a Merfolk you control or reveal a Merfolk card from your hand.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token (Silvergill Mentor)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
