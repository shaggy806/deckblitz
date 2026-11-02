import { defineCard } from "../define.js";

const JUMP_TEXT = "Jump — During your turn, Freya Crescent has flying.";
const MANA_TEXT = "{T}: Add {R}. Spend this mana only to cast an Equipment spell or activate an equip ability.";

export default defineCard({
  name: "Freya Crescent",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Rat", "Knight"],
  power: 1,
  toughness: 1,
  text: `${JUMP_TEXT}\n${MANA_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["flying"],
      text: JUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        spendOnly: {
          spell: { subtype: "Equipment" },
          purposes: ["equip-ability"],
          text: "Spend this mana only to cast an Equipment spell or activate an equip ability.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
