import { defineCard } from "../define.js";

const TEXT = "Each player chooses a land they control of each basic land type. Return those lands to their owners' hands.";

/** A dual may be chosen as each of its types (the ruling). */
export default defineCard({
  name: "Planar Overlay",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: "basic-land-types",
    filter: { type: "land" },
    chosen: "return-to-hand",
    prompt: "Choose a land of each basic land type to return to its owner's hand",
  },
});
