import { defineCard } from "../define.js";

const LOOK_TEXT = "+2: Look at the top card of target player's library. You may put that card on the bottom of that player's library.";
const BRAINSTORM_TEXT = "0: Draw three cards, then put two cards from your hand on top of your library in any order.";
const BOUNCE_TEXT = "−1: Return target creature to its owner's hand.";
const ULTIMATE_TEXT =
  "−12: Exile all cards from target player's library, then that player shuffles their hand into their library.";

export default defineCard({
  name: "Jace, the Mind Sculptor",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 3,
  text: `${LOOK_TEXT}\n${BRAINSTORM_TEXT}\n${BOUNCE_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "library-bottom",
        leftover: "stay",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "look-and-choose", zone: "hand", min: 2, max: 2, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: BRAINSTORM_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      loyaltyCost: -12,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: 0, allBut: 0 },
          { kind: "shuffle-graveyard-into-library", target: 0, zones: ["hand"] },
        ],
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
});
