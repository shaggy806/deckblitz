import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 30545.
const TEXT = "{G}, {T}: Target attacking Human gets +1/+1 until end of turn.";

export default defineCard({
  name: "Crossroads Consecrator",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature", subtype: "Human" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
