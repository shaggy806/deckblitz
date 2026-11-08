import { defineCard } from "../define.js";

const TEXT =
  "{2}{U}, {T}: Put target creature on the bottom of its owner's library. That creature's controller reveals cards from the top of their library until they reveal a creature card. The player puts that card onto the battlefield and the rest on the bottom of their library in any order. Activate only as a sorcery.";

export default defineCard({
  name: "Proteus Staff",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-on-bottom-of-library", target: 0 },
          {
            kind: "reveal-until",
            whose: { controllerOf: 0 },
            filter: { type: "creature" },
            put: "battlefield",
            rest: "bottom-any-order",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
