import { defineCard } from "../define.js";

const TYPE_TEXT =
  "Creatures you control are artifacts in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";
const CAST_TEXT =
  "Whenever you cast an artifact spell, you lose 1 life and create a 2/2 black Necron Warrior artifact creature token.";

export default defineCard({
  name: "Biotransference",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${TYPE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addTypes: ["artifact"],
      typesOutsideBattlefield: { ofType: "creature", addTypes: ["artifact"] },
      text: TYPE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "create-token", token: "Necron Warrior Token", count: 1 },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
