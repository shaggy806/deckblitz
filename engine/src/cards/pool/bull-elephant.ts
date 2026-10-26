import { defineCard } from "../define.js";

const TEXT = "When this creature enters, sacrifice it unless you return two Forests you control to their owner's hand.";

export default defineCard({
  name: "Bull Elephant",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Two Forests or none: with fewer than two there's nothing to pay with.
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land", subtype: "Forest" }, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Return two Forests you control to their owner's hand? If you don't, sacrifice Bull Elephant.",
          effect: {
            kind: "choose-permanents",
            filter: { type: "land", subtype: "Forest", controlledBy: "you" },
            min: 2,
            upTo: 2,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return two Forests you control to their owner's hand",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
