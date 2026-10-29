import { defineCard } from "../define.js";

// EDHREC rank 17793.

export default defineCard({
  name: "Mirror Strike",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "All combat damage that would be dealt to you this turn by target unblocked creature is dealt to its controller instead.",
  targets: [{ kind: "permanent", filter: { type: "creature", unblocked: true } }],
  effect: {
    kind: "damage-rule",
    to: { players: "you" },
    by: { target: 0 },
    combat: true,
    redirectTo: "source-controller",
  },
});
