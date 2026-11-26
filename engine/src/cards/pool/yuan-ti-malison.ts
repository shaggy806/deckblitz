import { defineCard } from "../define.js";

// EDHREC rank 8654. "Attacking alone" (rule 506.5, `attackingAlone`): it's
// attacking and no other creature is; a counted stack of attacking tokens is
// never alone.
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
      condition: { kind: "source", filter: { attackingAlone: true } },
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
