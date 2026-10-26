import { defineCard } from "../define.js";

// EDHREC rank 10697.

const TEXT =
  "{T}, Sacrifice this artifact: Destroy all permanents except for artifacts and lands. Activate only during your upkeep.";

export default defineCard({
  name: "Scourglass",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "destroy-all", filter: { notTypes: ["artifact", "land"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
