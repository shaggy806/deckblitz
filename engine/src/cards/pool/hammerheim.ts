import { defineCard } from "../define.js";

// EDHREC rank 9704. "All landwalk abilities" is every landwalk keyword the
// engine has (rule 702.14 — the five basic types and Desert); no other kind
// of landwalk exists in the pool.

export default defineCard({
  name: "Hammerheim",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {R}.\n{T}: Target creature loses all landwalk abilities until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "lose-keywords",
        target: 0,
        keywords: ["plainswalk", "islandwalk", "swampwalk", "mountainwalk", "forestwalk", "desertwalk"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{T}: Target creature loses all landwalk abilities until end of turn.",
    },
  ],
});
