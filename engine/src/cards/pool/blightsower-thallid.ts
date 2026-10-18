import { defineCard } from "../define.js";

// Blightreaper Thallid's back face. "Transforms into Blightsower Thallid" is
// a transform to the back face; "or dies" is this face dying.
const TEXT =
  "When this creature transforms into Blightsower Thallid or dies, create a 1/1 green Phyrexian Saproling creature token.";

export default defineCard({
  name: "Blightsower Thallid",
  art: "https://cards.scryfall.io/art_crop/back/f/1/f1150ea9-02b5-4767-a529-6149d758830e.jpg",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Fungus"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Saproling Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Saproling Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Blightreaper Thallid", "Blightsower Thallid"],
  transform: true,
});
