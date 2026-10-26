import { defineCard } from "../define.js";

const TEXT = "When this creature enters, create a 5/5 green Wurm creature token with trample.";

export default defineCard({
  name: "Armada Wurm",
  manaCost: "{2}{G}{G}{W}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wurm Token (Trample)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
