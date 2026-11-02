import { defineCard } from "../define.js";

// Rulings:
//   [2024-09-20] Mana produced by Overgrown Zealot's last ability can be used to pay morph or
//     disguise costs when turning a face-down permanent face up or to pay costs associated with
//     turning a manifested or cloaked permanent face up.
//
// The spend restriction names the special action (`ManaSpendPurpose`), which
// every one of those ways of turning it face up pays through.

const ANY_TEXT = "{T}: Add one mana of any color.";
const TWO_TEXT = "{T}: Add two mana of any one color. Spend this mana only to turn permanents face up.";

export default defineCard({
  name: "Overgrown Zealot",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 0,
  toughness: 4,
  text: `${ANY_TEXT}\n${TWO_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: ANY_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: {
          purposes: ["turn-face-up"],
          text: "Spend this mana only to turn permanents face up.",
        },
      },
      resolve: null,
      text: TWO_TEXT,
    },
  ],
});
