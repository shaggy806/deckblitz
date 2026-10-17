import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

const LORD_TEXT = "Squirrels you control get +1/+1.";

export default defineCard({
  name: "Deep Forest Hermit",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: `Vanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhen this creature enters, create four 1/1 green Squirrel creature tokens.\n${LORD_TEXT}`,
  static: [
    ...vanishing(3).static,
    {
      affects: { scope: "creatures-you-control", subtype: "Squirrel" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    ...vanishing(3).triggered,
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: 4 },
      resolve: null,
      text: "When this creature enters, create four 1/1 green Squirrel creature tokens.",
    },
  ],
});
