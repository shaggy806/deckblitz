import { defineCard } from "../define.js";
import { CHOSEN_THIS_WAY } from "../../effects.js";

// EDHREC rank 1516.
// Each player chooses a creature type, the active player first (the ruling, rule 101.4); then every
// player's creature cards of any chosen type enter together, each under its owner's control.

export default defineCard({
  name: "Patriarch's Bidding",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player chooses a creature type. Each player returns all creature cards of a type chosen this way from their graveyard to the battlefield.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, for: { creatureType: true } },
      {
        kind: "with-choices",
        effect: {
          kind: "return-from-graveyard",
          from: "each-graveyard",
          filter: { type: "creature", subtypes: [CHOSEN_THIS_WAY] },
          destination: "battlefield",
          count: "all",
        },
      },
    ],
  },
});
