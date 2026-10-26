import { defineCard } from "../define.js";

export default defineCard({
  name: "Jaraku the Interloper",
  art: "https://cards.scryfall.io/art_crop/front/c/a/ca03131a-9bd4-4fba-b95c-90f1831e86e7.jpg",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  text: "Remove a ki counter from Jaraku: Counter target spell unless its controller pays {2}.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ki", count: 1 } },
      targets: ["spell"],
      effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
      resolve: null,
      text: "Remove a ki counter from Jaraku: Counter target spell unless its controller pays {2}.",
    },
  ],
  faces: ["Callow Jushi", "Jaraku the Interloper"],
  flip: true,
});
