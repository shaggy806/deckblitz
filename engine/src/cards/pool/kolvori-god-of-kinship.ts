import { defineCard } from "../define.js";

// A modal DFC; the back face is The Ringhart Crest.

const STATIC = "As long as you control three or more legendary creatures, Kolvori gets +4/+2 and has vigilance.";
const LOOK =
  "{1}{G}, {T}: Look at the top six cards of your library. You may reveal a legendary creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Kolvori, God of Kinship",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 2,
  toughness: 4,
  text: `${STATIC}\n${LOOK}`,
  faces: ["Kolvori, God of Kinship", "The Ringhart Crest"],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 3, countsSelf: true },
      grantPt: [4, 2],
      grantKeywords: ["vigilance"],
      text: STATIC,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", supertype: "legendary" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK,
    },
  ],
});
