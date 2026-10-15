import { defineCard } from "../define.js";

// EDHREC rank 17976.
//
// Rulings:
//   [2026-01-27] You don't choose a target for Paramecia Coloniex's last ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you exile Paramecia Coloniex
//     this way. You choose a target for that ability as it goes on the stack. Each player may
//     respond to this triggered ability as normal.


const DIES_TEXT =
  "When this creature dies, you may exile it. When you do, put target creature card from your graveyard on top of your library.";

// Undead Butler's "you may exile it. When you do" — the reflexive trigger
// targets once the exile has happened, so the Coloniex can't be the card —
// putting the card on top of the library (Golgari Thug).
export default defineCard({
  name: "Paramecia Coloniex",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Worm"],
  power: 2,
  toughness: 2,
  text: `When this creature enters, mill three cards. (Put the top three cards of your library into your graveyard.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "When this creature enters, mill three cards.",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Paramecia Coloniex?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: {
                kind: "reflexive-trigger",
                targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
                effect: { kind: "put-on-library", target: 0, position: "top" },
                text: "When you do, put target creature card from your graveyard on top of your library.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
