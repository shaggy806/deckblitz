import { defineCard } from "../define.js";

// EDHREC rank 18872.

const TAP_TEXT = "{T}: Tap target creature.";
const UNTAP_TEXT = "Whenever you cast a white spell, you may untap this creature.";

export default defineCard({
  name: "Ballynock Trapper",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${TAP_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "may", prompt: "Untap Ballynock Trapper?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
