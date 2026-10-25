import { defineCard } from "../define.js";

const TEXT =
  "When Tuktuk the Explorer dies, create Tuktuk the Returned, a legendary 5/5 colorless Goblin Golem artifact creature token.";

export default defineCard({
  name: "Tuktuk the Explorer",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Tuktuk the Returned", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
