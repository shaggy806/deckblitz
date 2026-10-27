import { defineCard } from "../define.js";

const TEXT =
  "When this artifact enters or is put into a graveyard from the battlefield, create a 1/1 colorless Servo artifact creature token.";
const TOKEN = { kind: "create-token", token: "Servo Token", count: 1 } as const;

export default defineCard({
  name: "Servo Schematic",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: TOKEN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: TOKEN,
      resolve: null,
      text: TEXT,
    },
  ],
});
