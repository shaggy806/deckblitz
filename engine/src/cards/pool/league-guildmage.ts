import { defineCard } from "../define.js";

const DRAW_TEXT = "{3}{U}, {T}: Draw a card.";
const COPY_TEXT =
  "{X}{R}, {T}: Copy target instant or sorcery spell you control with mana value X. You may choose new targets for the copy.";

export default defineCard({
  name: "League Guildmage",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${DRAW_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
    {
      cost: { mana: "{X}{R}", tap: true },
      // The spell's mana value includes its own chosen {X} (the rulings).
      targets: [
        {
          kind: "spell",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
