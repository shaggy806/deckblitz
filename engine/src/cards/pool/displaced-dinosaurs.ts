import { defineCard } from "../define.js";

// Doctor Who (WHO). EDHREC rank 4670.
// Rulings:
//   The permanent enters as a 7/7 Dinosaur creature that still has its other types and abilities;
//   it doesn't enter and then become one, so abilities that look for its power, toughness or
//   creature types as it enters see them.
//
// A replacement over other permanents entering (rule 614.12): the types and the
// 7/7 base (layer 7b) are in place as it enters, and last after the Dinosaurs
// are gone (rule 611.2c).

const TEXT =
  "As a historic permanent you control enters, it becomes a 7/7 Dinosaur creature in addition to its other types. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Displaced Dinosaurs",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 7,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: {
          controlledBy: "you",
          anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
        },
        enterAs: { addTypes: ["creature"], addSubtypes: ["Dinosaur"], power: 7, toughness: 7 },
      },
      text: TEXT,
    },
  ],
});
