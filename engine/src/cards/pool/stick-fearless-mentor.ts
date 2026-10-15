import { defineCard } from "../define.js";

// EDHREC rank 20241.
// The source's end of the damage (`deals-damage`): any source you control —
// a permanent, a spell, an ability's source — dealing damage to you, once
// each turn (rule 603.2).

const TEXT =
  "Whenever a source you control deals damage to you, exile the top card of your library. You may play it until the end of your next turn. This ability triggers only once each turn.";

export default defineCard({
  name: "Stick, Fearless Mentor",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "you" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
