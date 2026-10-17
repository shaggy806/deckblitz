import { defineCard } from "../define.js";

// EDHREC rank 3009.

export default defineCard({
  name: "Royal Treatment",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gains hexproof until end of turn. Create a Royal Role token attached to that creature. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has ward {1}.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "create-token", token: "Royal Role Token", count: 1, attachedTo: 0 },
    ],
  },
});
