import { defineCard } from "../define.js";

export default defineCard({
  name: "Sword Dancer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 2,
  text: "{W}{W}: Target attacking creature gets -1/-0 until end of turn.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{W}{W}: Target attacking creature gets -1/-0 until end of turn.",
    },
  ],
});
