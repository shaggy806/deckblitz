import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const RUIN =
  "{2}, {T}, Sacrifice this land: Destroy target nonbasic land an opponent controls. Each player searches their library for a basic land card, puts it onto the battlefield, then shuffles.";

// Ixalan (XLN). EDHREC rank 911.
export default defineCard({
  name: "Field of Ruin",
  types: ["land"],
  text: `{T}: Add {C}.\n${RUIN}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "land", notSupertype: "basic" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "for-each-player",
            who: "each-player",
            choicesHeld: true,
            effect: { kind: "search-library", who: "that-player", filter: { type: "land", supertype: "basic" }, destination: "battlefield", min: 0, max: 1 },
          },
        ],
      },
      resolve: null,
      text: RUIN,
    },
  ],
});
