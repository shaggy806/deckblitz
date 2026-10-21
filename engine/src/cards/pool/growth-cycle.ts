import { defineCard } from "../define.js";

// Core Set 2020. The bonus is counted once, as it resolves — while this one
// is still on the stack, so it doesn't count itself (the rulings).
export default defineCard({
  name: "Growth Cycle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 until end of turn. It gets an additional +2/+2 until end of turn for each card named Growth Cycle in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      {
        kind: "modify-pt",
        target: 0,
        power: { product: [2, { countInGraveyard: { name: "Growth Cycle", ownedBy: "you" } }] },
        toughness: { product: [2, { countInGraveyard: { name: "Growth Cycle", ownedBy: "you" } }] },
        duration: "end-of-turn",
      },
    ],
  },
});
