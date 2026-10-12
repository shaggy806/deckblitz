import { defineCard } from "../define.js";

export default defineCard({
  name: "Sunhome Guildmage",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{1}{R}{W}: Creatures you control get +1/+0 until end of turn.\n{2}{R}{W}: Create a 1/1 red and white Soldier creature token with haste.",
  activated: [
    {
      cost: { mana: "{1}{R}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{R}{W}: Creatures you control get +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{2}{R}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Red-White Soldier Token", count: 1 },
      resolve: null,
      text: "{2}{R}{W}: Create a 1/1 red and white Soldier creature token with haste.",
    },
  ],
});
