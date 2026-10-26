import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 19110.
export default defineCard({
  name: "Primal Forcemage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Whenever another creature you control enters, that creature gets +3/+3 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another creature you control enters, that creature gets +3/+3 until end of turn.",
    },
  ],
});
