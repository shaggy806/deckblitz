import { defineCard } from "../define.js";

// EDHREC rank 15062; top-1000 commander #720. "Treasure tokens you created
// this turn" are the Treasure tokens that entered under your control this
// turn (rule 111.2: a token enters under its creator's control), counted as
// the ability resolves, those since sacrificed included.
//
// "Whenever an opponent casts a spell or activates an ability" is written as
// two entries, one per event (Kai Winn's shape): never the same event, and
// nothing on the card counts "this ability". Its
// intervening "if" (rule 603.4) reads the mana that paid the spell or the
// ability's own cost (`manaSpent` — "mana from a Treasure", its origin): a
// mana ability counts too (`orMana`, 605.3a) — a Signet's {1} paid with a
// Treasure's mana — but not the Treasure's own mana ability, which spends
// none.

const TAP_TEXT = "{T}: Target opponent creates X Treasure tokens, where X is the number of Treasure tokens you created this turn.";
const TRIGGER_TEXT =
  "Whenever an opponent casts a spell or activates an ability, if mana from a Treasure was spent to cast it or activate it, put a +1/+1 counter on target creature, then draw a card.";
const fromTreasure = [{ from: { subtype: "Treasure" } }] as const;
const reward = {
  kind: "sequence",
  effects: [
    { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    { kind: "draw", amount: 1 },
  ],
} as const;

export default defineCard({
  name: "Vazi, Keen Negotiator",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TAP_TEXT}\n${TRIGGER_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { turnHistory: "entered", who: "you", filter: { token: true, subtype: "Treasure" } },
        who: "target-controller",
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { manaSpent: fromTreasure } },
      targets: ["creature"],
      effect: reward,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "opponent", orMana: true, manaSpent: fromTreasure },
      targets: ["creature"],
      effect: reward,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
