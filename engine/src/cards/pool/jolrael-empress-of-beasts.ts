import { defineCard } from "../define.js";

// EDHREC rank 18395. Only the lands that player controls as it resolves; they
// keep their abilities and get no creature type (the rulings).
const TEXT =
  "{2}{G}, {T}, Discard two cards: All lands target player controls become 3/3 creatures until end of turn. They're still lands.";

export default defineCard({
  name: "Jolrael, Empress of Beasts",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true, discard: { count: 2 } },
      targets: ["player"],
      effect: {
        kind: "become",
        filter: { type: "land", controlledBy: "you" },
        controlledByTarget: 0,
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
