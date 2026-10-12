import { defineCard } from "../define.js";

// A Mount saddled this way (rule 702.171b) was saddled by no creature
// (702.171c). A Vehicle that becomes a creature has its printed power and
// toughness (rule 301.7b).
const HASTE_TEXT = "Mounts and Vehicles you control have haste.";
const MOUNT_TEXT = "Whenever a Mount you control enters, it becomes saddled until end of turn.";
const VEHICLE_TEXT = "Whenever a Vehicle you control enters, it becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Kolodin, Triumph Caster",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 3,
  text: `${HASTE_TEXT}\n${MOUNT_TEXT}\n${VEHICLE_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Mount", "Vehicle"], controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Mount" } },
      targets: [],
      effect: { kind: "become-saddled", target: "trigger-object" },
      resolve: null,
      text: MOUNT_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Vehicle" } },
      targets: [],
      effect: { kind: "add-types", target: "trigger-object", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: VEHICLE_TEXT,
    },
  ],
});
