import { defineCard } from "../define.js";

// EDHREC rank 13618. The artifact card is chosen as this resolves, not
// targeted, from that player's graveyard.

export default defineCard({
  name: "Grasping Tentacles",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent mills eight cards. You may put an artifact card from that player's graveyard onto the battlefield under your control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 8 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        from: { target: 0 },
        filter: { type: "artifact" },
        min: 0,
        max: 1,
        destination: "battlefield",
        under: "you",
        leftover: "stay",
      },
    ],
  },
});
