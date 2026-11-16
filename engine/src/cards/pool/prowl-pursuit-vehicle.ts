import { defineCard } from "../define.js";

// Back face of Prowl, Stoic Strategist. "If this is the second time this
// ability has resolved this turn" is `resolved-this-turn` (Scythecat Cub).

const ENTER_TEXT =
  "Whenever another creature or Vehicle you control enters, put a +1/+1 counter on Prowl. If this is the second time this ability has resolved this turn, convert Prowl.";

export default defineCard({
  name: "Prowl, Pursuit Vehicle",
  art: "https://cards.scryfall.io/art_crop/back/f/0/f0a3dc50-a5c4-4073-8fec-2f68544bc2a1.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  text: `Living metal (During your turn, this Vehicle is also a creature.)\n${ENTER_TEXT}`,
  static: [{ affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: "Living metal" }],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "conditional", condition: { kind: "resolved-this-turn", n: 2 }, then: { kind: "transform", target: "source" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Prowl, Stoic Strategist", "Prowl, Pursuit Vehicle"],
  transform: true,
});
