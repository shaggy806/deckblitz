import { defineCard } from "../define.js";

// EDHREC rank 19848.

export default defineCard({
  name: "No Way Out",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards. You create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
    ],
  },
});
