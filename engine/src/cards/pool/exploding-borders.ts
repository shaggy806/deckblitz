import { defineCard } from "../define.js";

export default defineCard({
  name: "Exploding Borders",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Domain — Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle. Exploding Borders deals X damage to target player or planeswalker, where X is the number of basic land types among lands you control.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      // X is counted after the land is put onto the battlefield (the ruling).
      { kind: "damage", amount: { basicLandTypes: "you" }, target: 0 },
    ],
  },
});
