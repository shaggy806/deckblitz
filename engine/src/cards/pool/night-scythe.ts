import { defineCard } from "../define.js";

export default defineCard({
  name: "Night Scythe",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nInvasion Beams — When this Vehicle enters, create a 2/2 black Necron Warrior artifact creature token.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
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
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Necron Warrior Token", count: 1 },
      resolve: null,
      text: "Invasion Beams — When this Vehicle enters, create a 2/2 black Necron Warrior artifact creature token.",
    },
  ],
});
