import { defineCard } from "../define.js";

export default defineCard({
  name: "Budoka Gardener",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 2,
  toughness: 1,
  text: "{T}: You may put a land card from your hand onto the battlefield. If you control ten or more lands, flip this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "land" }, atLeast: 10 },
            then: { kind: "flip", target: "source" },
          },
        ],
      },
      resolve: null,
      text: "{T}: You may put a land card from your hand onto the battlefield. If you control ten or more lands, flip this creature.",
    },
  ],
  faces: ["Budoka Gardener", "Dokai, Weaver of Life"],
  flip: true,
});
