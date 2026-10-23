import { defineCard } from "../define.js";

// EDHREC rank 18998.
const TEXT = "When this creature enters, you may return another permanent you control to its owner's hand.";

export default defineCard({
  name: "Aviary Mechanic",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 2,
  text: TEXT,
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
