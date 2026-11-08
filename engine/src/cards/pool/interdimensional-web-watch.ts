import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this artifact enters, exile the top two cards of your library. Until the end of your next turn, you may play those cards.";
const MANA_TEXT = "{T}: Add two mana in any combination of colors. Spend this mana only to cast spells from exile.";

export default defineCard({
  name: "Interdimensional Web Watch",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "until-end-of-your-next-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: { castFrom: { zones: ["exile"] }, text: "Spend this mana only to cast spells from exile." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
