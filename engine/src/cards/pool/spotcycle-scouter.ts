import { defineCard } from "../define.js";

export default defineCard({
  name: "Spotcycle Scouter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  text: "When this Vehicle enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When this Vehicle enters, scry 2.",
    },
  ],
});
