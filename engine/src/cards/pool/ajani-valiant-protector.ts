import { defineCard } from "../define.js";

// Aether Revolt. The +1 is Vivien, Nature's Avenger's reveal (no creature card:
// the whole library is revealed and randomized — its ruling); the −11's X is
// read as it resolves.
const PLUS2_TEXT = "+2: Put two +1/+1 counters on up to one target creature.";
const PLUS1_TEXT =
  "+1: Reveal cards from the top of your library until you reveal a creature card. Put that card into your hand and the rest on the bottom of your library in a random order.";
const ULT_TEXT =
  "−11: Put X +1/+1 counters on target creature, where X is your life total. That creature gains trample until end of turn.";

export default defineCard({
  name: "Ajani, Valiant Protector",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 4,
  text: `${PLUS2_TEXT}\n${PLUS1_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: PLUS2_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "reveal-until", filter: { type: "creature" }, put: "hand", rest: "bottom-random" },
      resolve: null,
      text: PLUS1_TEXT,
    },
    {
      loyaltyCost: -11,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: { lifeTotal: "you" } },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
