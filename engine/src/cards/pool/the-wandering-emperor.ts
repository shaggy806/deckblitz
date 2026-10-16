import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] You may still only activate one of The Wandering Emperor's loyalty abilities on
//     the turn she entered the battlefield.

const INSTANT =
  "As long as The Wandering Emperor entered this turn, you may activate her loyalty abilities any time you could cast an instant.";
const PLUS = "+1: Put a +1/+1 counter on up to one target creature. It gains first strike until end of turn.";
const MINUS = "−1: Create a 2/2 white Samurai creature token with vigilance.";
const EXILE = "−2: Exile target tapped creature. You gain 2 life.";

export default defineCard({
  name: "The Wandering Emperor",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  loyalty: 3,
  keywords: ["flash"],
  text: `Flash\n${INSTANT}\n${PLUS}\n${MINUS}\n${EXILE}`,
  static: [
    {
      affects: { scope: "self" },
      // Teferi, Master of Time's instant-speed permission, gated (rule 604.3)
      // on her having entered this turn (Shardmage's Rescue). Still one
      // loyalty ability a turn (the ruling, rule 606.3).
      condition: { kind: "source", filter: { enteredThisTurn: true } },
      loyaltyAtInstantSpeed: true,
      text: INSTANT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Samurai Token", count: 1 },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: EXILE,
    },
  ],
});
