import { defineCard } from "../define.js";

export default defineCard({
  name: "S.H.I.E.L.D. Helicarrier",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this Vehicle enters, create two 1/1 white Soldier creature tokens.\nCrew 6 (Tap any number of creatures you control with total power 6 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 6, filter: { type: "creature" } },
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
      text: "Crew 6",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2 },
      resolve: null,
      text: "When this Vehicle enters, create two 1/1 white Soldier creature tokens.",
    },
  ],
});
