import { defineCard } from "../define.js";

// EDHREC rank 22365.
// Makes Thopter → use "Thopter Token".

export default defineCard({
  name: "Rangers' Aetherhive",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance\nWhenever you activate an exhaust ability, create a 1/1 colorless Thopter artifact creature token with flying.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", exhaust: true },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: "Whenever you activate an exhaust ability, create a 1/1 colorless Thopter artifact creature token with flying.",
    },
  ],
});
