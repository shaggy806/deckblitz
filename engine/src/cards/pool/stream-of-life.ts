import { defineCard } from "../define.js";

export default defineCard({
  name: "Stream of Life",
  // Pinned: Scryfall answers "Stream of Life" by name with Infirmary Healer // Stream of Life,
  // whose prepare spell shares the name.
  art: "341aa1b2-e600-4580-b0cd-e1582b75dc81",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target player gains X life.",
  targets: ["player"],
  effect: { kind: "gain-life", amount: "x", toControllerOfTarget: 0 },
});
