import { defineCard } from "../define.js";

const ADD = "{U}: Target creature becomes an artifact in addition to its other types until end of turn.";
const REMOVE = "{U}: Until end of turn, target artifact creature becomes blue and isn't an artifact.";

export default defineCard({
  name: "Neurok Transmuter",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ADD}\n${REMOVE}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "become", target: 0, addTypes: ["artifact"], duration: "end-of-turn" },
      resolve: null,
      text: ADD,
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "become", target: 0, removeTypes: ["artifact"], duration: "end-of-turn" },
          { kind: "become", target: 0, setColors: ["U"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: REMOVE,
    },
  ],
});
