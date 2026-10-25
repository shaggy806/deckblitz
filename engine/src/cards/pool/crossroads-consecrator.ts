import { defineCard } from "../define.js";

// EDHREC rank 30545. Kithkin Daggerdare's shape, narrowed to Humans.

export default defineCard({
  name: "Crossroads Consecrator",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{G}, {T}: Target attacking Human gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature", subtype: "Human" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, {T}: Target attacking Human gets +1/+1 until end of turn.",
    },
  ],
});
