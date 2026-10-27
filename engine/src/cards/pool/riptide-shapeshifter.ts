import { defineCard } from "../define.js";

const TEXT =
  "{2}{U}{U}, Sacrifice this creature: Choose a creature type. Reveal cards from the top of your library until you reveal a creature card of that type. Put that card onto the battlefield and shuffle the rest into your library.";

export default defineCard({
  name: "Riptide Shapeshifter",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "reveal-until",
          filter: { type: "creature", subtype: "$chosen" },
          put: "battlefield",
          rest: "shuffle",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
