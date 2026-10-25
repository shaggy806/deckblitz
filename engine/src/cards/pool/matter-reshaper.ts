import { defineCard } from "../define.js";

// EDHREC rank 8044.
//
// Rulings:
//   [2016-01-22] If you don't put the card onto the battlefield for any reason, you put the card
//     into your hand.
//   [2016-01-22] If you put an Aura card onto the battlefield this way, you choose what it
//     enchants as it enters the battlefield.
// A permanent card is anything but an instant or sorcery (Deadly Brew). The card
// is revealed whatever it is; one not put onto the battlefield goes to the hand
// (Parcelbeast's shape).

const DIES_TEXT =
  "When this creature dies, reveal the top card of your library. You may put that card onto the battlefield if it's a permanent card with mana value 3 or less. Otherwise, put that card into your hand.";

export default defineCard({
  name: "Matter Reshaper",
  manaCost: "{2}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 3,
  toughness: 2,
  text: `({C} represents colorless mana.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 0,
        max: 1,
        filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
