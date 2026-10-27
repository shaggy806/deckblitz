import { defineCard } from "../define.js";

const X = { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Accelerated Mutation",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is the greatest mana value among permanents you control.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
});
