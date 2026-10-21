import { defineCard } from "../define.js";

// Core Set 2020. The −1 is Evolutionary Leap's reveal; with no creature card
// the whole library is revealed and put back in a random order (the ruling).
const PLUS_TEXT = "+1: Put three +1/+1 counters on up to one target creature.";
const MINUS_TEXT =
  "−1: Reveal cards from the top of your library until you reveal a creature card. Put that card into your hand and the rest on the bottom of your library in a random order.";
const ULT_TEXT = "−6: Target creature gets +10/+10 and gains trample until end of turn.";

export default defineCard({
  name: "Vivien, Nature's Avenger",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vivien"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "reveal-until", filter: { type: "creature" }, put: "hand", rest: "bottom-random" },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 10, toughness: 10, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
