import { defineCard } from "../define.js";

const FORMIDABLE_TEXT =
  "Formidable — {4}{R}{R}: Create a 4/4 red Dragon creature token with flying. Activate only if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Dragon Whisperer",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `{R}: This creature gains flying until end of turn.\n{1}{R}: This creature gets +1/+0 until end of turn.\n${FORMIDABLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{4}{R}{R}", tap: false },
      // Checked as it's activated only (its ruling).
      condition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "create-token", token: "Dragon Token (Dragonback Assault)", count: 1 },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
