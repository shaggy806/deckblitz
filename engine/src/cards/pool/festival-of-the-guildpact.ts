import { defineCard } from "../define.js";

// EDHREC rank 25228.
//
// Rulings:
//   You draw a card when Festival of the Guildpact resolves, not when damage is prevented.
export default defineCard({
  name: "Festival of the Guildpact",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next X damage that would be dealt to you this turn.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", to: { players: "you" }, amount: "x" },
      { kind: "draw", amount: 1 },
    ],
  },
});
