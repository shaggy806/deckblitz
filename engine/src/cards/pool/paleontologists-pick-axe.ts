import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 18291. Its back face, Dinosaur Headdress, is a copy of the
// creature card chosen among the craft materials (rule 702.167c's cards exiled
// with it) each time it becomes attached.

const ATTACK_TEXT = "Whenever equipped creature attacks, draw a card, then discard a card.";
const CRAFT_TEXT =
  "Craft with one or more creatures {5} ({5}, Exile this artifact, Exile one or more creatures you control and/or creature cards from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Paleontologist's Pick-Axe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {1}\n${CRAFT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
    craft(
      "{5}",
      { count: 1, orMore: true, filter: { type: "creature" }, text: "one or more creatures" },
      "Craft with one or more creatures {5}",
    ),
  ],
  faces: ["Paleontologist's Pick-Axe", "Dinosaur Headdress"],
  transform: true,
});
