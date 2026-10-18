import { defineCard } from "../define.js";

// Herbology Instructor's back face.
//
// X is its power as the ability resolves, or as it last existed on the
// battlefield if it has left (the ruling) — `powerOf: "source"`.

const TEXT =
  "When this creature transforms into Malady Invoker, target creature an opponent controls gets -0/-X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Malady Invoker",
  art: "https://cards.scryfall.io/art_crop/back/4/0/40ab763d-05ee-408d-aeba-eaf18c4f2e21.jpg",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Treefolk"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: 0,
        toughness: { product: [{ powerOf: "source" }, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Herbology Instructor", "Malady Invoker"],
  transform: true,
});
