import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). Doomskar Titan's shape: the creatures you control as it resolves.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Flame-Kin Zealot",
  manaCost: "{1}{R}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Berserker"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, creatures you control get +1/+1 and gain haste until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, creatures you control get +1/+1 and gain haste until end of turn.",
    },
  ],
});
