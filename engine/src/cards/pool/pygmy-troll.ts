import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 29482.
//
// Once per blocking creature (Kolaghan Aspirant's trigger).

const TRIGGER_TEXT = "Whenever this creature becomes blocked by a creature, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Pygmy Troll",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 1,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n{G}: Regenerate this creature.`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
});
