import { defineCard } from "../define.js";

// EDHREC rank 3355. Transforms into The Grand Evolution.
const ENTERS_TEXT =
  "When Vorinclex enters, search your library for up to two Forest cards, reveal them, put them into your hand, then shuffle.";
const FLIP_TEXT =
  "{6}{G}{G}: Exile Vorinclex, then return it to the battlefield transformed under its owner's control. Activate only as a sorcery.";

export default defineCard({
  name: "Vorinclex",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Praetor"],
  power: 6,
  toughness: 6,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${ENTERS_TEXT}\n${FLIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtype: "Forest" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 2,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{G}{G}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
  faces: ["Vorinclex", "The Grand Evolution"],
  transform: true,
});
