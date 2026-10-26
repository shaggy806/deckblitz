import { defineCard } from "../define.js";
import { hauntSpell } from "../helpers.js";

// Haunt (rule 702.55): exiled haunting a creature, its last ability
// triggers from exile when that creature dies.
//
// EDHREC rank 24782.
//
// Rulings:
//   [2006-02-01] "For each player" means for each player currently in the game, which is normally
//     two. A Two-Headed Giant game has four players. In a Free-for-All multiplayer game, players
//     who have been eliminated or who are outside your range of influence don't count toward the
//     total.

export default defineCard({
  name: "Benediction of Moons",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 1 life for each player.\nHaunt (When this spell card is put into a graveyard after resolving, exile it haunting target creature.)\nWhen the creature this card haunts dies, you gain 1 life for each player.",
  targets: [],
  effect: { kind: "gain-life", amount: { countPlayers: "each-player" } },
  triggered: [
    hauntSpell(),
    {
      trigger: { on: "haunted-dies" },
      targets: [],
      effect: { kind: "gain-life", amount: { countPlayers: "each-player" } },
      resolve: null,
      text: "When the creature this card haunts dies, you gain 1 life for each player.",
    },
  ],
});
