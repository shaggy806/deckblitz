import { defineCard } from "../define.js";

// EDHREC rank 6112.
//
// Rulings:
//   The last ability checks your graveyard as it would trigger; if it does
//   trigger, it checks again as it resolves.
//   You pay all costs and follow all timing rules for cards played this way:
//   a land card only during your main phase with the stack empty.
//
// The loot is Joshua, Phoenix's Dominant's. The attack trigger picks a card
// at random (Viconia's), exiles it and lets you *play* it this turn
// (Containment Construct's permission, a land too).

const LOOT_TEXT = "When Tersa Lightshatter enters, discard up to two cards, then draw that many cards.";
const ATTACK_TEXT =
  "Whenever Tersa Lightshatter attacks, if there are seven or more cards in your graveyard, exile a card at random from your graveyard. You may play that card this turn.";

export default defineCard({
  name: "Tersa Lightshatter",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${LOOT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true, atMost: 2 },
          { kind: "draw", amount: { thisWay: "discarded" } },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 7 },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        then: { kind: "exile", target: 0, mayPlay: { duration: "end-of-turn", play: true } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
