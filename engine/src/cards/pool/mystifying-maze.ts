import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 6855.
//
// Rulings:
//   [2010-08-15] The targeted creature doesn't have to be attacking you. It can be attacking a
//     planeswalker, or (in a multiplayer game) it can be attacking another player.
//   [2010-08-15] At the beginning of the next end step, the affected creature is returned to the
//     battlefield even if Mystifying Maze is no longer on the battlefield by then.
//
// Nezahal's delayed flicker, on a target: the return is a delayed trigger
// linked to this exile, so it doesn't need the Maze to still be around.
const EXILE_TEXT =
  "{4}, {T}: Exile target attacking creature an opponent controls. At the beginning of the next end step, return it to the battlefield tapped under its owner's control.";

export default defineCard({
  name: "Mystifying Maze",
  types: ["land"],
  text: `{T}: Add {C}.\n${EXILE_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{4}", tap: true },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        tapped: true,
        returnText: "Return the exiled creature to the battlefield tapped under its owner's control.",
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
