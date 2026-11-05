import { defineCard } from "../define.js";

// Ojer Pakpatiq, Deepest Epoch's back face.
const MANA_TEXT = "{T}: Add {U}. Remove a time counter from this land.";
const TRANSFORM_TEXT =
  "{2}{U}, {T}: Transform this land. Activate only if it has no time counters on it and only as a sorcery.";

export default defineCard({
  name: "Temple of Cyclical Time",
  art: "https://cards.scryfall.io/art_crop/back/a/9/a9d71007-bc04-4dff-ad3f-e2c0b5b4400e.jpg",
  colors: [],
  types: ["land"],
  text: `(Transforms from Ojer Pakpatiq, Deepest Epoch.)\n${MANA_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        also: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      condition: { kind: "self-counters", counter: "time", compare: { op: "eq", n: 0 } },
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
      sorcerySpeed: true,
    },
  ],
  faces: ["Ojer Pakpatiq, Deepest Epoch", "Temple of Cyclical Time"],
  transform: true,
});
