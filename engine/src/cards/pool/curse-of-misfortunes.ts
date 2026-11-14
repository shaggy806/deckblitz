import { defineCard } from "../define.js";

// EDHREC rank 9302.
//
// "A Curse attached to enchanted player" is the `attachedToPlayer:
// "enchanted-player"` clause (this Curse itself among them, so it can't find
// another Curse of Misfortunes), compared by name through `sameNameWith`'s
// `permanents` (rule 201.2a). The Curse found enters attached to "that player"
// (`attachedTo: { player: "enchanted-player" }`, rule 303.4); one that can't
// enchant them stays in the library (303.4i). Both read the player as this
// Aura last existed if it has left by then (rule 608.2h).

const TEXT =
  "At the beginning of your upkeep, you may search your library for a Curse card that doesn't have the same name as a Curse attached to enchanted player, put it onto the battlefield attached to that player, then shuffle.";

export default defineCard({
  name: "Curse of Misfortunes",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Curse card?",
        effect: {
          kind: "search-library",
          filter: {
            subtype: "Curse",
            not: { sameNameWith: { permanents: { subtype: "Curse", attachedToPlayer: "enchanted-player" } } },
          },
          destination: "battlefield",
          min: 0,
          max: 1,
          attachedTo: { player: "enchanted-player" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
