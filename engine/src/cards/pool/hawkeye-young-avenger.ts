import { defineCard } from "../define.js";

const TEXT =
  "If a source you control would deal noncombat damage to an opponent or a permanent an opponent controls, instead it deals that much damage plus X, where X is Hawkeye's power.";

export default defineCard({
  name: "Hawkeye, Young Avenger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Archer", "Hero"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plusOf: "this-power",
        combat: false,
        source: { controlledBy: "you" },
        to: "opponent-side",
      },
      text: TEXT,
    },
  ],
});
