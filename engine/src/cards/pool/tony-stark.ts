import { defineCard } from "../define.js";

// EDHREC rank 8822. A modal DFC whose front can transform into its back face,
// The Invincible Iron Man (Bruce Banner's shape).
const LOOK_TEXT =
  "{1}, {T}: Look at the top four cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const TRANSFORM_TEXT = "{4}{U}{R}: Transform Tony Stark. Activate only as a sorcery.";

export default defineCard({
  name: "Tony Stark",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Hero"],
  power: 1,
  toughness: 3,
  text: `${LOOK_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      cost: { mana: "{4}{U}{R}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Tony Stark", "The Invincible Iron Man"],
});
