import { defineCard } from "../define.js";

// Apocalypse (APC).
const TEXT = "When this creature dies, create a 6/6 black Wurm creature token with trample.";

export default defineCard({
  name: "Penumbra Wurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wurm Token (black 6/6 trample)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
