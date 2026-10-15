import { defineCard } from "../define.js";

const EXHAUST_TEXT =
  "Exhaust — Tap another untapped Mount or Vehicle you control: This Vehicle becomes an artifact creature. Put a +1/+1 counter on it for each Mount and/or Vehicle you control other than this Vehicle.";

const MOUNT_OR_VEHICLE = { subtypes: ["Mount", "Vehicle"], controlledBy: "you" } as const;

export default defineCard({
  name: "Spire Mechcycle",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)\nCrew 2`,
  activated: [
    {
      // "Another": tapOthers never counts the source unless `includeSelf`.
      cost: { mana: null, tap: false, tapOthers: { count: 1, filter: MOUNT_OR_VEHICLE } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          // No duration: it stays an artifact creature (Rocketeer Boostbuggy).
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "permanent" },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countOf: MOUNT_OR_VEHICLE, excludeSelf: true },
          },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
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
      text: "Crew 2",
    },
  ],
});
