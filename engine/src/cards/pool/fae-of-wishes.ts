import { defineCard } from "../define.js";

// EDHREC rank 20016.

export default defineCard({
  name: "Fae of Wishes",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n{1}{U}, Discard two cards: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, discard: { count: 2 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{1}{U}, Discard two cards: Return this creature to its owner's hand.",
    },
  ],
  faces: ["Fae of Wishes", "Granted"],
  adventure: true,
});
