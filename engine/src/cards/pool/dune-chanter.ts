import { defineCard } from "../define.js";

const DESERT_TEXT =
  "Lands you control and land cards you own that aren't on the battlefield are Deserts in addition to their other types.";
const MANA_TEXT = 'Lands you control have "{T}: Add one mana of any color."';
const MILL_TEXT = "{T}: Mill two cards. You gain 1 life for each land card milled this way.";

export default defineCard({
  name: "Dune Chanter",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Druid"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${DESERT_TEXT}\n${MANA_TEXT}\n${MILL_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addSubtypes: ["Desert"],
      outsideBattlefield: { ofType: ["land"], addSubtypes: ["Desert"] },
      text: DESERT_TEXT,
    },
    {
      affects: { scope: "lands-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}: Add one mana of any color.",
        },
      ],
      text: MANA_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          { kind: "gain-life", amount: { thisWay: "milled", filter: { type: "land" } } },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
