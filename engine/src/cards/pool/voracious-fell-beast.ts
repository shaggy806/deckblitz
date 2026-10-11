import { defineCard } from "../define.js";

// EDHREC rank 6820.
//
// Syphon Flesh's shape on an enters trigger: the Food waits for every edict
// to be answered and counts only the creatures actually sacrificed — an
// opponent with no creature adds none.
const ETB_TEXT =
  "When this creature enters, each opponent sacrifices a creature of their choice. Create a Food token for each creature sacrificed this way. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";

export default defineCard({
  name: "Voracious Fell Beast",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Drake", "Beast"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
          { kind: "create-token", token: "Food Token", count: { thisWay: "sacrificed" } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
