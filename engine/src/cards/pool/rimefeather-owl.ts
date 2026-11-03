import { defineCard } from "../define.js";

// Any permanent with an ice counter is snow, whoever put it there (the ruling).

const PT_TEXT = "Rimefeather Owl's power and toughness are each equal to the number of snow permanents on the battlefield.";
const ICE_TEXT = "{1}{S}: Put an ice counter on target permanent.";
const SNOW_TEXT = "Permanents with ice counters on them are snow.";

export default defineCard({
  name: "Rimefeather Owl",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PT_TEXT}\n${ICE_TEXT}\n${SNOW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { countOf: { supertype: "snow" } }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
    {
      affects: { scope: "filter", filter: { counters: { kind: "ice", compare: { op: "gte", n: 1 } } } },
      addSupertypes: ["snow"],
      text: SNOW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: ["permanent"],
      effect: { kind: "add-counter", target: 0, counter: "ice", amount: 1 },
      resolve: null,
      text: ICE_TEXT,
    },
  ],
});
