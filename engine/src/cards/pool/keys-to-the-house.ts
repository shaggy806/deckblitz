import { defineCard } from "../define.js";

// EDHREC rank 11096. The door ability is Marina Vendrell's: a target Room
// you control, locking an unlocked door or unlocking a locked one.
const LAND =
  "{1}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const DOOR =
  "{3}, {T}, Sacrifice this artifact: Lock or unlock a door of target Room you control. Activate only as a sorcery.";

export default defineCard({
  name: "Keys to the House",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${LAND}\n${DOOR}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: LAND,
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { subtype: "Room", controlledBy: "you" } }],
      effect: { kind: "unlock-door", target: 0, orLock: true },
      resolve: null,
      text: DOOR,
    },
  ],
});
