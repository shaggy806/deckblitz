import { defineCard } from "../define.js";

export default defineCard({
  name: "Infantry Veteran",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{T}: Target attacking creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target attacking creature gets +1/+1 until end of turn.",
    },
  ],
});
