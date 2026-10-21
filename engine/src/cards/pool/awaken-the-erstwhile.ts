import { defineCard } from "../define.js";

// Each player creates as many Zombies as they themselves discarded (the
// ruling) — Dark Deal's per-player `thisWay` count.
export default defineCard({
  name: "Awaken the Erstwhile",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player discards all the cards in their hand, then creates that many 2/2 black Zombie creature tokens.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "each-player" },
      {
        kind: "create-token",
        token: "Zombie Token",
        who: "each-player",
        count: { thisWay: "discarded", who: "each" },
      },
    ],
  },
});
