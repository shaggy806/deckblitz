import { defineCard } from "../define.js";

const OFF = "{2}, {T}: Target snow land is no longer snow.";
const ON = "{2}, {T}: Target nonsnow basic land becomes snow.";

// No duration printed: it lasts as long as the land stays there (rule 611.2a).
export default defineCard({
  name: "Arcum's Weathervane",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${OFF}\n${ON}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", supertype: "snow" } }],
      effect: { kind: "become", target: 0, removeSupertypes: ["snow"], duration: "permanent" },
      resolve: null,
      text: OFF,
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", supertype: "basic", notSupertype: "snow" } }],
      effect: { kind: "become", target: 0, addSupertypes: ["snow"], duration: "permanent" },
      resolve: null,
      text: ON,
    },
  ],
});
