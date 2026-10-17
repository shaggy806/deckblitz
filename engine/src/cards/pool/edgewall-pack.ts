import { defineCard } from "../define.js";

const TEXT = "When this creature enters, create a 1/1 black Rat creature token with \"This token can't block.\"";

export default defineCard({
  name: "Edgewall Pack",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
