import { defineCard } from "../define.js";

export default defineCard({
  name: "Orochi Eggwatcher",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 1,
  toughness: 1,
  text: "{2}{G}, {T}: Create a 1/1 green Snake creature token. If you control ten or more creatures, flip this creature.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Snake Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "creature" }, atLeast: 10 },
            then: { kind: "flip", target: "source" },
          },
        ],
      },
      resolve: null,
      text: "{2}{G}, {T}: Create a 1/1 green Snake creature token. If you control ten or more creatures, flip this creature.",
    },
  ],
  faces: ["Orochi Eggwatcher", "Shidako, Broodmistress"],
  flip: true,
});
