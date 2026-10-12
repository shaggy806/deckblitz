import { defineCard } from "../define.js";

export default defineCard({
  name: "Exorcist",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{1}{W}, {T}: Destroy target black creature.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["B"], type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: Destroy target black creature.",
    },
  ],
});
