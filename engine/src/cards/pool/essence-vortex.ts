import { defineCard } from "../define.js";

export default defineCard({
  name: "Essence Vortex",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Destroy target creature unless its controller pays life equal to its toughness. A creature destroyed this way can't be regenerated.",
  targets: ["creature"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payLifeAmount: { toughnessOf: 0 }, text: "Pay {X} life" }],
    otherwise: { kind: "destroy", target: 0, cantBeRegenerated: true },
  },
});
