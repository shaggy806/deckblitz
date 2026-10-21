import { defineCard } from "../define.js";

// EDHREC rank 22282.

export default defineCard({
  name: "Swarm Guildmage",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{4}{B}, {T}: Creatures you control get +1/+0 and gain menace until end of turn. (They can't be blocked except by two or more creatures.)\n{1}{G}, {T}: You gain 2 life.",
  activated: [
    {
      cost: { mana: "{4}{B}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "{4}{B}, {T}: Creatures you control get +1/+0 and gain menace until end of turn.",
    },
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "{1}{G}, {T}: You gain 2 life.",
    },
  ],
});
