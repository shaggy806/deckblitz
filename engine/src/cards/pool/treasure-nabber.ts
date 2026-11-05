import { defineCard } from "../define.js";

// Rulings: tapping for improvise isn't tapping for mana; one that's left the
// battlefield (a sacrificed Treasure) isn't followed; it stays tapped.

const TEXT = "Whenever an opponent taps an artifact for mana, gain control of that artifact until the end of your next turn.";

export default defineCard({
  name: "Treasure Nabber",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "opponent", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "gain-control", target: "trigger-object", untilEndOfTurn: false, until: "until-end-of-your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
