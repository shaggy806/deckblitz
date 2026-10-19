import { defineCard } from "../define.js";

// EDHREC rank 14143.
// Ambrosia Whiteheart's untargeted `choose-permanents`, chosen as it resolves
// — `min: 0` for "you may", `exceptSource` for "another".

const TEXT =
  "Natural Shelter — When this creature enters, you may return another permanent you control to its owner's hand.";

export default defineCard({
  name: "Rescuer Chwinga",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental", "Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 0,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another permanent you control to its owner's hand?",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
