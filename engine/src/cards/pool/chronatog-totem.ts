import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {U}.";
const ANIMATE_TEXT = "{1}{U}: This artifact becomes a 1/2 blue Atog artifact creature until end of turn.";
const PUMP_TEXT =
  "{0}: This creature gets +3/+3 until end of turn. You skip your next turn. Activate only once each turn and only if this permanent is a creature.";

export default defineCard({
  name: "Chronatog Totem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${ANIMATE_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: 1,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Atog"],
        setColors: ["U"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      oncePerTurn: true,
      condition: { kind: "source", filter: { type: "creature" } },
      text: PUMP_TEXT,
    },
  ],
});
