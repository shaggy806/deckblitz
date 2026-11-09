import { defineCard } from "../define.js";

// Kaladesh. The +1 may target nothing, or a creature with no activated ability
// (the ruling). An opponent under the emblem chooses which two to untap (the
// ruling): `untapLimit`'s untap-step choice.
const PLUS_TEXT = "+1: Until your next turn, up to one target creature gets -3/-0 and its activated abilities can't be activated.";
const MINUS_TEXT = "−1: You gain 2 life and draw a card.";
const ULT_TEXT = "−7: You get an emblem with \"Your opponents can't untap more than two permanents during their untap steps.\"";
const EMBLEM_TEXT = "Your opponents can't untap more than two permanents during their untap steps.";

export default defineCard({
  name: "Dovin Baan",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dovin"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "until-your-next-turn" },
          { kind: "prohibit", prohibits: [{ act: "activate", who: "each-player", target: 0 }], duration: "until-your-next-turn" },
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
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 1 },
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
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: { affects: { scope: "self" }, untapLimit: { who: "opponents", count: 2 }, text: EMBLEM_TEXT },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
