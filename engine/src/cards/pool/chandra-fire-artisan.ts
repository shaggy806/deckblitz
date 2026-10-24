import { defineCard } from "../define.js";

// EDHREC rank 10672.
//
// Rulings:
//   If multiple creatures deal combat damage to Chandra at the same time, those counters are all
//     removed at once, and her first ability triggers only once.
//   If all of Chandra's loyalty counters are removed, her first ability has her deal damage even
//     though she's left the battlefield.
//   Chandra's first ability triggers if she loses loyalty from being dealt damage, from her last
//     loyalty ability being activated, or because an effect removes loyalty counters from her.
//     If an effect simply causes Chandra to leave the battlefield, no counters were removed and
//     so her ability doesn't trigger.
//
// Loyalty lost to damage (rule 306.8) or a minus cost (606.4) is counters
// removed, one event for damage dealt at once; "that much" is how many went.
const TRIGGER_TEXT =
  "Whenever one or more loyalty counters are removed from Chandra, she deals that much damage to target opponent or planeswalker.";

export default defineCard({
  name: "Chandra, Fire Artisan",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text:
    `${TRIGGER_TEXT}\n` +
    "+1: Exile the top card of your library. You may play it this turn.\n" +
    "−7: Exile the top seven cards of your library. You may play them this turn.",
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "loyalty" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "+1: Exile the top card of your library. You may play it this turn.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 7, duration: "end-of-turn" },
      resolve: null,
      text: "−7: Exile the top seven cards of your library. You may play them this turn.",
    },
  ],
});
