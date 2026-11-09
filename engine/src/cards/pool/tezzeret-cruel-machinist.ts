import { defineCard } from "../define.js";

// −7 puts the chosen cards from your hand onto the battlefield face down
// (rule 708.3) as 5/5 artifact creatures with no name, text or mana cost
// (708.2) — any cards, lands and instants included, since face down each is
// only a 5/5 artifact creature. They aren't manifested: they're turned face
// up only by their own morph or disguise costs (702.37e).

export default defineCard({
  name: "Tezzeret, Cruel Machinist",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 4,
  text:
    "+1: Draw a card.\n" +
    "0: Until your next turn, target artifact you control becomes a 5/5 creature in addition to its other types.\n" +
    "−7: Put any number of cards from your hand onto the battlefield face down. They're 5/5 artifact creatures.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "+1: Draw a card.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "become",
        target: 0,
        power: 5,
        toughness: 5,
        addTypes: ["creature"],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: "0: Until your next turn, target artifact you control becomes a 5/5 creature in addition to its other types.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 99,
        destination: "battlefield",
        leftover: "stay",
        enterAs: { faceDown: "5/5 artifact creature" },
      },
      resolve: null,
      text: "−7: Put any number of cards from your hand onto the battlefield face down. They're 5/5 artifact creatures.",
    },
  ],
});
