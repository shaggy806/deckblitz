import { defineCard } from "../define.js";

// EDHREC rank 27457.
//
// Serra Inquisitors' shape: one trigger for blocking one or more Orcs, one
// for becoming blocked by one or more, each once however many (rule 509.3a,
// 509.3c).
const TEXT = "Whenever this creature blocks or becomes blocked by one or more Orcs, this creature gets +0/+2 until end of turn.";

const PUMP = { kind: "modify-pt", target: "source", power: 0, toughness: 2, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Dwarven Soldier",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", blocking: { subtype: "Orc" } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self", blockers: { filter: { subtype: "Orc" } } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
