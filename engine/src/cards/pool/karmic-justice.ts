import { defineCard } from "../define.js";

// EDHREC rank 4028.
//
// Rulings:
//   If a spell or ability an opponent controls destroys Karmic Justice,
//   Karmic Justice's ability will trigger.
//   Spells and abilities that cause you to sacrifice permanents will not
//   cause Karmic Justice's ability to trigger.
//
// The `destroyed` trigger's `byOpponent`: an effect's destruction only (never
// lethal damage's, a state-based action), by a spell or ability an opponent
// controls; "that opponent" is who controlled it (`"trigger-player"`).
const TEXT =
  "Whenever a spell or ability an opponent controls destroys a noncreature permanent you control, you may destroy target permanent that opponent controls.";

export default defineCard({
  name: "Karmic Justice",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "destroyed", who: "you-control", filter: { notTypes: ["creature"] }, byOpponent: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: {} }],
      effect: { kind: "may", prompt: "Destroy that permanent?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
