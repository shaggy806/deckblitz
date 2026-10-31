import { defineCard } from "../define.js";

// "This spell has flash as long as you control a Merfolk" (`flashIf` with a
// `condition`): it may be cast any time an instant could while the Merfolk
// is there as the cast begins (rule 601.3d).
export default defineCard({
  name: "Crashing Tide",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashIf: { condition: { kind: "controls", filter: { subtype: "Merfolk" }, atLeast: 1 } },
  text: "This spell has flash as long as you control a Merfolk.\nReturn target creature to its owner's hand.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
