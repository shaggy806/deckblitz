import { defineCard } from "../define.js";

// EDHREC rank 9763. The stun counters come off any permanents, yours too,
// spread as the player likes (the rulings); "this way" is what came off.
const ATTACK_TEXT =
  "Whenever Sensational Spider-Man attacks, tap target creature defending player controls and put a stun counter on it. Then you may remove up to three stun counters from among all permanents. Draw cards equal to the number of stun counters removed this way.";

export default defineCard({
  name: "Sensational Spider-Man",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          { kind: "remove-counters", from: {}, anyController: true, counter: "stun", count: 3, among: true, upTo: true },
          { kind: "draw", amount: { thisWay: "counters-removed" } },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
