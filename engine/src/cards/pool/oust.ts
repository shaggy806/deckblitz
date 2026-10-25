import { defineCard } from "../define.js";

// EDHREC rank 16660.

export default defineCard({
  name: "Oust",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put target creature into its owner's library second from the top. Its controller gains 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
      // "Its controller" — the creature's controller as it last existed on
      // the battlefield (rule 608.2h; the ruling: controller, not owner).
      { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});
