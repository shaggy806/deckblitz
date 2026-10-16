import { defineCard } from "../define.js";

// EDHREC rank 11708. The Lost Caverns of Ixalan.
//
// Casey Jones's look-four, the reveal narrowed to "an artifact or Pirate card".

const TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal an artifact or Pirate card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Staunch Crewmate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ type: "artifact" }, { subtype: "Pirate" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
