import { defineCard } from "../define.js";

// EDHREC rank 8654. "Attacking alone" (rule 506.5): it's attacking and no
// other creature is. Only the active player's creatures attack, and a creature
// that changes control leaves combat (506.4), so "no other attacking creature
// you control" is "no other attacking creature". A static's condition leaves
// its own permanent out of the `controls` count.
const ALONE_TEXT = "This creature can't be blocked as long as it's attacking alone.";
const VENTURE_TEXT =
  "Whenever this creature deals combat damage to a player, venture into the dungeon. (Enter the first room or advance to the next room.)";

export default defineCard({
  name: "Yuan-Ti Malison",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Rogue"],
  power: 2,
  toughness: 1,
  text: `${ALONE_TEXT}\n${VENTURE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attacking: true } },
          { kind: "not", of: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 1 } },
        ],
      },
      grantKeywords: ["unblockable"],
      text: ALONE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: VENTURE_TEXT,
    },
  ],
});
