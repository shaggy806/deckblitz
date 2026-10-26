import { defineCard } from "../define.js";

const TEXT = "As long as you control a red permanent, this creature gets +1/+0 and has first strike.";

export default defineCard({
  name: "Ember Weaver",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { colors: ["R"] }, atLeast: 1, countsSelf: true },
      grantPt: [1, 0],
      grantKeywords: ["first-strike"],
      text: TEXT,
    },
  ],
});
