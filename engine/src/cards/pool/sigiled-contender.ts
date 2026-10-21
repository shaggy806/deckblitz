import { defineCard } from "../define.js";

const TEXT = "This creature has lifelink as long as it has a +1/+1 counter on it.";

export default defineCard({
  name: "Sigiled Contender",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Damage dealt by this creature also causes you to gain that much life.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["lifelink"],
      text: TEXT,
    },
  ],
});
