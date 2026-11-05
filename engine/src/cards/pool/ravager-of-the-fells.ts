import { defineCard } from "../define.js";

// The creature slot is "that player or that planeswalker's controller"'s
// (`sameController` on slot 0, Searing Blaze's shape), up to one.

const TRANSFORM_TEXT =
  "Whenever this creature transforms into Ravager of the Fells, it deals 2 damage to target opponent or planeswalker and 2 damage to up to one target creature that player or that planeswalker's controller controls.";
const UPKEEP_TEXT = "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.";

export default defineCard({
  name: "Ravager of the Fells",
  art: "https://cards.scryfall.io/art_crop/back/b/3/b3819a11-2f3e-4304-a1b0-6abf893c89c5.jpg",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TRANSFORM_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [
        "opponent-or-planeswalker",
        {
          kind: "optional",
          of: { kind: "other", of: "creature", than: { slot: 0 }, sameController: true, sameObjectAllowed: true },
        },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 2, target: 1 },
        ],
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Huntmaster of the Fells", "Ravager of the Fells"],
  transform: true,
});
