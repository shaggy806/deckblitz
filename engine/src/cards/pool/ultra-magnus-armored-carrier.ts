import { defineCard } from "../define.js";

// The back face of Ultra Magnus, Tactician, cast converted by its More Than
// Meets the Eye (rule 702.162a). Living metal (702.161a): during your turn
// it's an artifact creature as well. "Those creatures" are the attacking
// creatures you control as the ability resolves, the same ones it just made
// indestructible; with total power 8 or more it converts (transform, 701.28a).
//
// Rulings:
//   [2022-10-14] While it's a creature, the Vehicle has its printed power and toughness.
//   [2022-10-14] The mana value of a converted permanent on the battlefield is equal to the mana
//     value of the card's front face, no matter which face is up.
const LIVING_METAL_TEXT = "Living metal (During your turn, this Vehicle is also a creature.)";
const FORMIDABLE_TEXT =
  "Formidable — Whenever Ultra Magnus attacks, attacking creatures you control gain indestructible until end of turn. If those creatures have total power 8 or greater, convert Ultra Magnus.";
const ATTACKERS = { type: "creature", controlledBy: "you", attacking: true } as const;

export default defineCard({
  name: "Ultra Magnus, Armored Carrier",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/6/8/687695ad-d212-4da4-a326-ce9876afdda2.jpg",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 7,
  keywords: ["haste"],
  text: `${LIVING_METAL_TEXT}\nHaste\n${FORMIDABLE_TEXT}`,
  faces: ["Ultra Magnus, Tactician", "Ultra Magnus, Armored Carrier"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{R}{G}{W}" },
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: LIVING_METAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: ATTACKERS, keyword: "indestructible", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: {
              kind: "aggregate",
              value: { aggregate: "sum", of: "power", filter: ATTACKERS },
              compare: { op: "gte", n: 8 },
            },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: FORMIDABLE_TEXT,
    },
  ],
});
