import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 11508.
//
// One destroy-all over the three types, as one event (rule 603.10a), none
// regenerated (rule 701.15).

export default defineCard({
  name: "Jokulhaups",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all artifacts, creatures, and lands. They can't be regenerated.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { typesAnyOf: ["artifact", "creature", "land"] },
    cantBeRegenerated: true,
  },
});
