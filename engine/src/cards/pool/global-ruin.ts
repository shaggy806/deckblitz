import { defineCard } from "../define.js";

const TEXT = "Each player chooses from the lands they control a land of each basic land type, then sacrifices the rest.";

/** A dual may be chosen for either or both of its types (the ruling); a land
 * with no basic land type is necessarily sacrificed. */
export default defineCard({
  name: "Global Ruin",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: "basic-land-types",
    filter: { type: "land" },
    rest: "sacrifice",
    prompt: "Choose a land of each basic land type to keep — the other lands are sacrificed",
  },
});
