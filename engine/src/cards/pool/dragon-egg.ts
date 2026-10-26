import { defineCard } from "../define.js";

const DIES_TEXT =
  "When this creature dies, create a 2/2 red Dragon creature token with flying and \"{R}: This token gets +1/+0 until end of turn.\"";

export default defineCard({
  name: "Dragon Egg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Egg"],
  power: 0,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Firebreathing)", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
