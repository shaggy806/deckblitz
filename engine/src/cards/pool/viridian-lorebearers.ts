import { defineCard } from "../define.js";

// EDHREC rank 29807.

const TEXT =
  "{3}{G}, {T}: Target creature gets +X/+X until end of turn, where X is the number of artifacts your opponents control.";
const X = { countOf: { type: "artifact", controlledBy: "opponent" } } as const;

export default defineCard({
  name: "Viridian Lorebearers",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
