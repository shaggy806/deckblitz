import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 17541.
//
// The −4 is Mulch's reveal (every land among the two, the rest elsewhere),
// the lands onto the battlefield untapped. The −12 is Garruk Wildspeaker's:
// the creatures are fixed as it resolves (ruling).
const PLUS = "+3: You gain 3 life.";
const MINUS =
  "−4: Reveal the top two cards of your library. Put all land cards from among them onto the battlefield and the rest into your hand.";
const ULT = "−12: Creatures you control get +5/+5 and gain trample until end of turn.";

export default defineCard({
  name: "Nissa, Nature's Artisan",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 5,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        reveal: true,
        min: 2,
        max: 2,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -12,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 5,
            toughness: 5,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
