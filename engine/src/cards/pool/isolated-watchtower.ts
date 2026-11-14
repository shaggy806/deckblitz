import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 10247.
//
// "Activate only if" (rule 602.5b) holds when some one opponent controls at
// least two more lands than you (the ruling), each opponent compared on
// their own. The scry finishes before the top card may be revealed.

const SCRY_TEXT =
  "{2}, {T}: Scry 1, then you may reveal the top card of your library. If a basic land card is revealed this way, put it onto the battlefield tapped. Activate only if an opponent controls at least two more lands than you.";

export default defineCard({
  name: "Isolated Watchtower",
  types: ["land"],
  text: `{T}: Add {C}.\n${SCRY_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{2}", tap: true },
      condition: { kind: "opponent-controls-more", filter: { type: "land" }, by: 2 },
      targets: [],
      effect: {
        kind: "scry",
        amount: 1,
        then: {
          kind: "may",
          prompt: "Reveal the top card of your library?",
          effect: {
            kind: "reveal-top",
            then: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "land", supertype: "basic" } },
              then: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
            },
          },
        },
      },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
