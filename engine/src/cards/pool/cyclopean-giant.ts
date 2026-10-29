import { defineCard } from "../define.js";

// Rule 305.7: the land is a Swamp with only "{T}: Add {B}", indefinitely.
// "Exile this card" is the card the trigger is about, still in the graveyard
// (a copy that died is exiled too — the Vesuvan Shapeshifter ruling); if the
// target is illegal, the ability doesn't resolve and the card stays.
export default defineCard({
  name: "Cyclopean Giant",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 4,
  toughness: 2,
  text: "When this creature dies, target land becomes a Swamp. Exile this card.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: 0, setSubtypes: ["Swamp"], duration: "permanent" },
          { kind: "exile", target: "trigger-object" },
        ],
      },
      resolve: null,
      text: "When this creature dies, target land becomes a Swamp. Exile this card.",
    },
  ],
});
