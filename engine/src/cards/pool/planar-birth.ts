import { defineCard } from "../define.js";

export default defineCard({
  name: "Planar Birth",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return all basic land cards from all graveyards to the battlefield tapped under their owners' control.",
  effect: {
    kind: "return-from-graveyard",
    from: "each-graveyard",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    enterTapped: true,
    count: "all",
  },
});
