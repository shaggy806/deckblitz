import { defineCard } from "../define.js";

// EDHREC rank 28860.
//
// "Nighthawk or another Hero you control" is two triggers (Arahbo, the First
// Fang's shape): Nighthawk itself, whatever its types, and each other Hero.

const PUMP_TEXT = "Whenever Nighthawk or another Hero you control enters, target creature gets +1/+1 until end of turn.";
const PUMP = { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Nighthawk, Dark Defender",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: PUMP,
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Hero" } },
      targets: ["creature"],
      effect: PUMP,
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
