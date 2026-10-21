import { defineCard } from "../define.js";

// Core Set 2020. The −7 is a one-shot: only the fliers you control as it
// resolves get +5/+5 (the ruling).
const PLUS_TEXT = "+1: Until your next turn, up to one target creature gets -5/-0.";
const MINUS_TEXT = "−3: Return up to two target creatures to their owners' hands.";
const ULT_TEXT = "−7: Creatures you control with flying get +5/+5 until end of turn.";

export default defineCard({
  name: "Mu Yanling, Celestial Wind",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Yanling"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -5, toughness: 0, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", keyword: "flying" },
        power: 5,
        toughness: 5,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
