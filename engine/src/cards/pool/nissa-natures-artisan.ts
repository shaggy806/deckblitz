import { defineCard } from "../define.js";

// −4: Mulch's shape — `min` = `max` = 2 is clamped to the lands among the
// two, so every land is put onto the battlefield and the rest go to hand.
// −12: the creatures affected are fixed as it resolves (the ruling).
export default defineCard({
  name: "Nissa, Nature's Artisan",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 5,
  text: "+3: You gain 3 life.\n−4: Reveal the top two cards of your library. Put all land cards from among them onto the battlefield and the rest into your hand.\n−12: Creatures you control get +5/+5 and gain trample until end of turn.",
  activated: [
    {
      loyaltyCost: 3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "+3: You gain 3 life.",
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
      text: "−4: Reveal the top two cards of your library. Put all land cards from among them onto the battlefield and the rest into your hand.",
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
      text: "−12: Creatures you control get +5/+5 and gain trample until end of turn.",
    },
  ],
});
