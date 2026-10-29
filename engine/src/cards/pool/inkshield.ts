import { defineCard } from "../define.js";

// EDHREC rank 785.
//
// Rulings:
//   If multiple damage prevention effects would apply to combat damage that would be dealt to
//   you, you get to choose the order the prevention effects are applied in.
//
// - A `damage-rule` over combat damage to you this turn; its `then` runs per
//   damage event with "x" the damage that event had prevented, so the tokens
//   add up to the total prevented.
const TEXT =
  "Prevent all combat damage that would be dealt to you this turn. For each 1 damage prevented this way, create a 2/1 white and black Inkling creature token with flying.";

export default defineCard({
  name: "Inkshield",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "damage-rule",
    to: { players: "you" },
    combat: true,
    then: { kind: "create-token", token: "Inkling Token", count: "x" },
  },
});
