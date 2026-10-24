import { defineCard } from "../define.js";

// EDHREC rank 22660.
// The −1 is a delayed triggered ability for the rest of the turn (rule
// 603.7c): every creature that attacks gets its counter, before blockers are
// chosen (the ruling). The −6 reaches only the creatures you control as it
// resolves (the ruling).
const PLUS_TEXT = "+1: Put a +1/+1 counter on up to one target creature. It gains vigilance until end of turn.";
const MINUS_TEXT = "−1: Whenever a creature attacks this turn, put a +1/+1 counter on it.";
const ULT_TEXT = "−6: Creatures you control get +2/+2 and gain flying until end of turn.";

export default defineCard({
  name: "Basri, Devoted Paladin",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Basri"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "any", filter: { type: "creature" } } },
        effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
        text: "Whenever a creature attacks this turn, put a +1/+1 counter on it.",
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "flying",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
