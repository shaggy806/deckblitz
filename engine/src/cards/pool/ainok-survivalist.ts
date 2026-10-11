import { defineCard } from "../define.js";

// EDHREC rank 6771. Den Protector's megamorph shape (rule 702.37b): the
// +1/+1 counter only when it's turned up for its megamorph cost, the trigger
// however it's turned face up.
const UP_TEXT = "When this creature is turned face up, destroy target artifact or enchantment an opponent controls.";

export default defineCard({
  name: "Ainok Survivalist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Shaman"],
  power: 2,
  toughness: 1,
  text: `Megamorph {1}{G}\n${UP_TEXT}`,
  morph: { keyword: "megamorph", cost: "{1}{G}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
