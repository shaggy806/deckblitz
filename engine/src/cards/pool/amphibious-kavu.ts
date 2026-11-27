import { defineCard } from "../define.js";

// EDHREC rank 30312.
//
// Serra Inquisitors' shape; "blue and/or black" is either colour, an `anyOf`
// (`colors: ["U", "B"]` would want both).
const TEXT =
  "Whenever this creature blocks or becomes blocked by one or more blue and/or black creatures, this creature gets +3/+3 until end of turn.";

const PUMP = { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" } as const;
const BLUE_OR_BLACK = { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } as const;

export default defineCard({
  name: "Amphibious Kavu",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", blocking: BLUE_OR_BLACK },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "self", blockers: { filter: BLUE_OR_BLACK } },
      targets: [],
      effect: PUMP,
      resolve: null,
      text: TEXT,
    },
  ],
});
