import { defineCard } from "../define.js";

// EDHREC rank 16511. Ixalan. Lantern of the Lost's exile-all-graveyards cost
// shape, without the mana or the draw.
export default defineCard({
  name: "Sentinel Totem",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)\n{T}, Exile this artifact: Exile all graveyards.",
  activated: [
    {
      cost: { mana: null, tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-player" },
      resolve: null,
      text: "{T}, Exile this artifact: Exile all graveyards.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "When this artifact enters, scry 1.",
    },
  ],
});
