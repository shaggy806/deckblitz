import { defineCard } from "../define.js";

const TEXT = "Whenever this creature blocks or becomes blocked by one or more black creatures, this creature gets +2/+0 until end of turn.";

const PUMP = { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Serra Inquisitors",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", blocking: { colors: ["B"] } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self", blockers: { filter: { colors: ["B"] } } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
