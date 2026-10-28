import { CHOSEN_CREATURE_TYPE } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 17931.
//
// The type is chosen as the trigger resolves and replaces its creature types
// for good (`add-types`' `setSubtypes`, rule 205.1a — it stays an artifact).

const FACE_UP_TEXT =
  "When this creature is turned face up, it becomes the creature type of your choice. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Proteus Machine",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{0}" },
  text: `Morph {0} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "add-types", target: "source", setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "permanent" },
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
