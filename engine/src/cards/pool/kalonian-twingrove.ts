import { defineCard } from "../define.js";

const PT_TEXT = "Kalonian Twingrove's power and toughness are each equal to the number of Forests you control.";
const TOKEN_TEXT =
  "When this creature enters, create a green Treefolk Warrior creature token with \"This token's power and toughness are each equal to the number of Forests you control.\"";

export default defineCard({
  name: "Kalonian Twingrove",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treefolk Warrior Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
