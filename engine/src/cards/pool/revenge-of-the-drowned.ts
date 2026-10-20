import { defineCard } from "../define.js";

// EDHREC rank 22209. Its only target illegal as it resolves, the whole spell
// doesn't resolve (rule 608.2b) and no Zombie is made.

export default defineCard({
  name: "Revenge of the Drowned",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature's owner puts it on their choice of the top or bottom of their library. You create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: 1 },
    ],
  },
});
