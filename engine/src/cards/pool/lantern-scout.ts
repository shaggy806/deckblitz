import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 10886.
//
// Rally: once for this creature and once for each other Ally entering with
// it (the ruling) — Ondu Cleric's `thisOrAnother` pair.
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, creatures you control gain lifelink until end of turn.";

export default defineCard({
  name: "Lantern Scout",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "lifelink",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
