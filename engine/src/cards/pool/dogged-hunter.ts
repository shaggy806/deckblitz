import { defineCard } from "../define.js";

export default defineCard({
  name: "Dogged Hunter",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 1,
  text: "{T}: Destroy target creature token.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { token: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature token.",
    },
  ],
});
