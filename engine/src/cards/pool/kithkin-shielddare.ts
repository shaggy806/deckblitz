import { defineCard } from "../define.js";

export default defineCard({
  name: "Kithkin Shielddare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{W}, {T}: Target blocking creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{W}, {T}: Target blocking creature gets +2/+2 until end of turn.",
    },
  ],
});
