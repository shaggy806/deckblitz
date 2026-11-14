import { defineCard } from "../define.js";

// A mana ability that reveals from the hand first, as Metalworker's: the cards
// are chosen as it's activated (a mana ability can't stop to ask, rule 605.3b),
// any number including none (the first ruling), and {G} is added for each.
const TAP_TEXT =
  "{T}: Reveal any number of creature cards with power 5 or greater from your hand. Add {G} for each card revealed this way.";

export default defineCard({
  name: "Sacellum Godspeaker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: { thisWay: "revealed", who: "you" },
        first: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: { cardsInHand: "you" },
          filter: { type: "creature", power: { op: "gte", n: 5 } },
          destination: "reveal",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
