import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 23440.
//
// Not targeted: the permanent is chosen as the ability resolves (the ruling),
// and it's mandatory when there's another permanent to choose.

export default defineCard({
  name: "Invasive Species",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, return another permanent you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another permanent you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return another permanent you control to its owner's hand.",
    },
  ],
});
