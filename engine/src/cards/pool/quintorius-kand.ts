import { defineCard } from "../define.js";

// −6: the cards are exiled face up and may be played this turn, lands
// included, following the normal timing rules (the ruling).

const CAST_TEXT = "Whenever you cast a spell from exile, Quintorius Kand deals 2 damage to each opponent and you gain 2 life.";
const PLUS_TEXT = "+1: Create a 3/2 red and white Spirit creature token.";
const MINUS3_TEXT = "−3: Discover 4.";
const MINUS6_TEXT =
  "−6: Exile any number of target cards from your graveyard. Add {R} for each card exiled this way. You may play those cards this turn.";

export default defineCard({
  name: "Quintorius Kand",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Quintorius"],
  loyalty: 4,
  text: `${CAST_TEXT}\n${PLUS_TEXT}\n${MINUS3_TEXT}\n${MINUS6_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "exile" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "discover", amount: 4 },
      resolve: null,
      text: MINUS3_TEXT,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "exile", target: 0, mayPlay: { duration: "end-of-turn", play: true } },
          },
          { kind: "add-mana", mana: "R", amount: { thisWay: "exiled" } },
        ],
      },
      resolve: null,
      text: MINUS6_TEXT,
    },
  ],
});
