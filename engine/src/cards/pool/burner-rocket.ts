import { defineCard } from "../define.js";

export default defineCard({
  name: "Burner Rocket",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nWhen this Vehicle enters, target creature you control gets +2/+0 and gains trample until end of turn.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
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
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this Vehicle enters, target creature you control gets +2/+0 and gains trample until end of turn.",
    },
  ],
});
