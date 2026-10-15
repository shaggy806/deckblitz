import { defineCard } from "../define.js";

const TEXT = "When this creature enters, create two 3/3 white Knight creature tokens.";

export default defineCard({
  name: "Guarded Heir",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink (Damage dealt by this creature also causes you to gain that much life.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token (Guarded Heir)", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
