import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Federation — When Hoshi Sato enters, look at the top X cards of your library, where X is the number of creature types among non-Borg creatures you control. Put one of them into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Hoshi Sato, Exolinguist",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        // Federation's X: the different creature types among your non-Borg creatures.
        count: {
          aggregate: "distinct",
          of: { subtypesOf: "creature" },
          filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
        },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
