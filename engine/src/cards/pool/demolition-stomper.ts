import { defineCard } from "../define.js";

export default defineCard({
  name: "Demolition Stomper",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 10,
  toughness: 7,
  text: "This Vehicle can't be blocked by creatures with power 2 or less.\nCrew 5 (Tap any number of creatures you control with total power 5 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 5, filter: { type: "creature" } },
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
      text: "Crew 5",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This Vehicle can't be blocked by creatures with power 2 or less.",
    },
  ],
});
