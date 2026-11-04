import { defineCard } from "../define.js";

// Each player chooses in turn order from the active player, knowing the
// choices before theirs, and only then do the chosen cards enter, all at once
// (rule 101.4).
export default defineCard({
  name: "Exhume",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player puts a creature card from their graveyard onto the battlefield.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    choicesHeld: true,
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      leftover: "stay",
    },
  },
});
