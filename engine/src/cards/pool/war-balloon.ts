import { defineCard } from "../define.js";

// EDHREC rank 18294.
//
// Idol of False Gods' "as long as it has N or more counters, it's a
// creature" — a Vehicle has its printed 4/3, so no base P/T is set. It's
// already an artifact, so the static only adds the creature type (and the
// crew ability's own "artifact creature" changes nothing more).

const FIRE_TEXT = "{1}: Put a fire counter on this Vehicle.";
const ANIMATE_TEXT = "As long as this Vehicle has three or more fire counters on it, it's an artifact creature.";

export default defineCard({
  name: "War Balloon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${FIRE_TEXT}\n${ANIMATE_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "fire", compare: { op: "gte", n: 3 } },
      addTypes: ["creature"],
      text: ANIMATE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "fire", amount: 1 },
      resolve: null,
      text: FIRE_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
});
