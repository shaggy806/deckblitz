import { defineCard } from "../define.js";

// EDHREC rank 17597.

export default defineCard({
  name: "Conclave Guildmage",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{G}, {T}: Creatures you control gain trample until end of turn.\n{5}{W}, {T}: Create a 2/2 green and white Elf Knight creature token with vigilance.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{G}, {T}: Creatures you control gain trample until end of turn.",
    },
    {
      cost: { mana: "{5}{W}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Elf Knight Token", count: 1 },
      resolve: null,
      text: "{5}{W}, {T}: Create a 2/2 green and white Elf Knight creature token with vigilance.",
    },
  ],
});
