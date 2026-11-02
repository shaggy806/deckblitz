import { defineCard } from "../define.js";

// Rulings:
//   [2020-08-07] If an effect says that an opponent can't gain life, you can't have that player
//     gain life to pay Invigorate's alternative cost. If an effect instead replaces life gain,
//     such as that of Sulfuric Vortex, you may choose to pay the cost even though the cost's
//     action is replaced with nothing.

export default defineCard({
  name: "Invigorate",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "If you control a Forest, rather than pay this spell's mana cost, you may have an opponent gain 3 life.\nTarget creature gets +4/+4 until end of turn.",
  alternativeCost: {
    mana: "{0}",
    othersGainLife: { amount: 3, who: "an-opponent" },
    condition: { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
  },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
});
