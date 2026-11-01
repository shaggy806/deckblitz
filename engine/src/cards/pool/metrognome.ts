import { defineCard } from "../define.js";

// EDHREC rank 29085. The discard trigger works from the graveyard (rule
// 113.6k), only for a discard an opponent's spell or ability caused.

const DISCARD =
  "When a spell or ability an opponent controls causes you to discard Metrognome, create four 1/1 colorless Gnome artifact creature tokens.";
const MAKE = "{4}, {T}: Create a 1/1 colorless Gnome artifact creature token.";

export default defineCard({
  name: "Metrognome",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${DISCARD}\n${MAKE}`,
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 4 },
      resolve: null,
      text: DISCARD,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 1 },
      resolve: null,
      text: MAKE,
    },
  ],
});
