import { defineCard } from "../define.js";

export default defineCard({
  name: "Morningtide",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile all graveyards.",
  effect: { kind: "exile-graveyard", target: "each-player" },
});
