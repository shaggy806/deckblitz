import { defineCard } from "../define.js";

// EDHREC rank 19939. The lands are counted as the trigger resolves.
const TEXT =
  "Whenever this creature deals combat damage to a player, create a 1/1 colorless Sand creature token for each land you control.";

export default defineCard({
  name: "Dune-Brood Nephilim",
  manaCost: "{B}{R}{G}{W}",
  colors: ["W", "B", "R", "G"],
  types: ["creature"],
  subtypes: ["Nephilim"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Sand Token", count: { countOf: { type: "land", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
