import { defineCard } from "../define.js";
import { CHOSEN_THIS_WAY } from "../../effects.js";

// EDHREC rank 8832.
// Each player chooses a creature type, the active player first (rule 101.4); then every creature of
// none of the chosen types is destroyed.

export default defineCard({
  name: "Harsh Mercy",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player chooses a creature type. Destroy all creatures that aren't of a type chosen this way. They can't be regenerated.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, for: { creatureType: true } },
      {
        kind: "with-choices",
        effect: {
          kind: "destroy-all",
          filter: { type: "creature", notSubtypes: [CHOSEN_THIS_WAY] },
          cantBeRegenerated: true,
        },
      },
    ],
  },
});
