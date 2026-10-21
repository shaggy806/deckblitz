import { defineCard } from "../define.js";

// Commander 2019. Its power is a characteristic-defining ability (rule
// 604.3), Adeline's shape: it counts itself on the battlefield.
const POWER_TEXT = "Ironroot Warlord's power is equal to the number of creatures you control.";
const TOKEN_TEXT = "{3}{G}{W}: Create a 1/1 white Soldier creature token.";

export default defineCard({
  name: "Ironroot Warlord",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Soldier"],
  power: 0,
  toughness: 5,
  text: `${POWER_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { type: "creature", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
