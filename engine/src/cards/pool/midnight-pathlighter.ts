import { defineCard } from "../define.js";

// EDHREC rank 7610.
//
// The venture trigger is the batched combat-damage trigger: once per player
// dealt combat damage in one damage step, so a double striker's two steps
// venture twice (the ruling).
//
// Rulings:
//   [2021-07-23] Unblocked creatures with double strike deal damage twice, which will cause
//     Midnight Pathlighter's last ability to trigger twice.

const EVASION_TEXT = "Creatures you control can't be blocked except by legendary creatures.";
const VENTURE_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, venture into the dungeon. (Enter the first room or advance to the next room.)";

export default defineCard({
  name: "Midnight Pathlighter",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${EVASION_TEXT}\n${VENTURE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      cantBeBlockedBy: { notSupertype: "legendary" },
      text: EVASION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
  ],
});
