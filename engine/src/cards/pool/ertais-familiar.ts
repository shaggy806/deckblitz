import { defineCard } from "../define.js";

// One ability with two trigger events, each looking back in time: phasing
// out (rule 603.10b) and leaving the battlefield (603.10a).
const MILL_TEXT = "When this creature phases out or leaves the battlefield, mill three cards.";
const HOLD_TEXT = "{U}: Until your next upkeep, this creature can't phase out.";

const mill = { kind: "mill", target: "you", amount: 3 } as const;

export default defineCard({
  name: "Ertai's Familiar",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  keywords: ["phasing"],
  text: `Phasing (This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist.)\n${MILL_TEXT}\n${HOLD_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "phases-out", who: "self" },
      targets: [],
      effect: mill,
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: mill,
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "prohibit", prohibits: [{ act: "phase-out", target: "source" }], duration: "until-your-next-upkeep" },
      resolve: null,
      text: HOLD_TEXT,
    },
  ],
});
