import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).

const ETB =
  'When The Bringer of the Red Beard enters, create a red Equipment artifact token named Red Beard with "Equipped creature is red" and equip {1}.';

export default defineCard({
  name: "The Bringer of the Red Beard",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: `${ETB}\nRed creatures you control get +1/+0.\nEquipped creatures you control get +1/+0.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Red Beard Token", count: 1 },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Red creatures you control get +1/+0.",
    },
    {
      affects: { scope: "filter", filter: { type: "creature", equipped: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Equipped creatures you control get +1/+0.",
    },
  ],
});
