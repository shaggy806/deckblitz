import { defineCard } from "../define.js";

// Modern Horizons 2. The activation chooses nothing: it's a permission for one
// creature spell later this turn (a `player-effect`'s `once`, Whispersteel
// Dagger's), by the card's own timing and costs; two activations, the first
// Chainer having left and come back, are two casts (the rulings). "Didn't cast it
// from your hand" is anything else: cast from elsewhere, or not cast at all,
// Chainer itself included.

const DISCARD_TEXT =
  "Discard a card: You may cast a creature spell from your graveyard this turn. Activate only once each turn.";
const HASTE_TEXT =
  "Whenever a nontoken creature you control enters, if you didn't cast it from your hand, it gains haste until your next turn.";

export default defineCard({
  name: "Chainer, Nightmare Adept",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 3,
  toughness: 2,
  text: `${DISCARD_TEXT}\n${HASTE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: { from: "graveyard", filter: { type: "creature" }, upTo: 1 },
      },
      oncePerTurn: true,
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", token: false, not: { cast: true, castBy: "you", castFrom: "hand" } },
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "until-your-next-turn" },
      resolve: null,
      text: HASTE_TEXT,
    },
  ],
});
