import { defineCard } from "../define.js";

// EDHREC rank 13535.
//
// Power is read as the trigger resolves, every player's creatures (the
// ruling); all of them return at once, right after this leaves (rule 610.3 —
// `exile-all`'s `untilSourceLeaves`), and nothing is exiled if this left
// before the trigger resolved (610.3a). A token exiled is gone.
const TEXT =
  "When this artifact enters, exile all creatures with power 5 or greater until this artifact leaves the battlefield.";

export default defineCard({
  name: "Aligned Hedron Network",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Those creatures return under their owners' control.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "exile-all",
        filter: { type: "creature", power: { op: "gte", n: 5 } },
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
