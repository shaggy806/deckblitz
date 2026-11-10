import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 3322. Transforms into The Great Synthesis.
const CAST_TEXT = "Whenever you cast a noncreature spell with mana value 3 or greater, draw a card.";
const FLIP_TEXT =
  "{3}{U}: Exile Jin-Gitaxias, then return it to the battlefield transformed under its owner's control. " +
  "Activate only as a sorcery and only if you have seven or more cards in hand.";

export default defineCard({
  name: "Jin-Gitaxias",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 5,
  toughness: 5,
  text: `Ward {2}\n${CAST_TEXT}\n${FLIP_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { notTypes: ["creature"], manaValue: { op: "gte", n: 3 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      sorcerySpeed: true,
      condition: { kind: "hand-size", atLeast: 7 },
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Jin-Gitaxias", "The Great Synthesis"],
  transform: true,
});
