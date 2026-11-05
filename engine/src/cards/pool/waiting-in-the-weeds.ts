import { defineCard } from "../define.js";

export default defineCard({
  name: "Waiting in the Weeds",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Each player creates a 1/1 green Cat creature token for each untapped Forest they control.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    simultaneous: true,
    effect: {
      kind: "create-token",
      token: "1/1 Green Cat Token",
      count: { countOf: { subtype: "Forest", tapped: false, controlledBy: "you" }, forPlayer: "that-player" },
      who: "that-player",
    },
  },
});
