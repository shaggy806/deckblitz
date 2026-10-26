import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 23944. Enchant Swamp is its target filter;
// an Aura on something that's stopped being a Swamp goes to the graveyard
// (the ruling) — and comes back to hand off its own last ability.
const TAPPED = "When enchanted land becomes tapped, destroy it.";
const RETURN = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Spreading Algae",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Swamp\n${TAPPED}\n${RETURN}`,
  targets: [{ kind: "permanent", filter: { subtype: "Swamp" } }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: TAPPED,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
