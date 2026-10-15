import { defineCard } from "../define.js";

// EDHREC rank 11249. Secrets of Strixhaven Commander.
//
// Blood Money's count, narrowed to your side (Kaya's Wrath's `who`): each
// nontoken creature you controlled that this destroyed — one that
// regenerated or was indestructible wasn't.
export default defineCard({
  name: "Ceaseless Conflict",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy all creatures. Then create a 3/2 red and white Spirit creature token for each nontoken creature you controlled that was destroyed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      {
        kind: "create-token",
        token: "Spirit Token (Red-White)",
        count: { thisWay: "destroyed", who: "you", filter: { token: false } },
      },
    ],
  },
});
