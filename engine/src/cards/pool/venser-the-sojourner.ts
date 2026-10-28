import { defineCard } from "../define.js";

// Rulings: the +2 can target any permanent you own (Venser himself included,
// or one another player controls) and returns it under your control; the −1
// is a rule over every creature for the turn, not locked in as it resolves —
// the filter form of `restrict` (rule 611.2c) binds creatures that appear
// later and ones that have lost all abilities.

const FLICKER_TEXT =
  "+2: Exile target permanent you own. Return it to the battlefield under your control at the beginning of the next end step.";
const UNBLOCKABLE_TEXT = "−1: Creatures can't be blocked this turn.";
const EMBLEM_TEXT = '−8: You get an emblem with "Whenever you cast a spell, exile target permanent."';

export default defineCard({
  name: "Venser, the Sojourner",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Venser"],
  loyalty: 3,
  text: `${FLICKER_TEXT}\n${UNBLOCKABLE_TEXT}\n${EMBLEM_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { ownedBy: "you" } }],
      effect: {
        kind: "flicker",
        target: 0,
        underYourControl: true,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under your control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Whenever you cast a spell, exile target permanent.",
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you" },
            targets: ["permanent"],
            effect: { kind: "exile", target: 0 },
            resolve: null,
            text: "Whenever you cast a spell, exile target permanent.",
          },
        ],
      },
      resolve: null,
      text: EMBLEM_TEXT,
    },
  ],
});
