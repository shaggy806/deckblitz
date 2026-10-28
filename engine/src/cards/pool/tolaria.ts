import { defineCard } from "../define.js";

// EDHREC rank 18469.
//
// Losing banding takes every "bands with other" too (rule 702.22b); a band
// already formed lasts the combat (702.22e), but the upkeep-only timing means
// this is used before attacks.
export default defineCard({
  name: "Tolaria",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "{T}: Add {U}.\n{T}: Target creature loses banding and all \"bands with other\" abilities until end of turn. Activate only during any upkeep step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "lose-keywords",
        target: 0,
        keywords: ["banding", "bands-with-other"],
        duration: "end-of-turn",
      },
      resolve: null,
      condition: { kind: "turn-structure", steps: ["upkeep"] },
      text: "{T}: Target creature loses banding and all \"bands with other\" abilities until end of turn. Activate only during any upkeep step.",
    },
  ],
});
