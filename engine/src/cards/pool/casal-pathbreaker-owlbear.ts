import { defineCard } from "../define.js";

// Back face of Casal, Lurkwood Pathfinder.

const TRANSFORM_TEXT =
  "When this creature transforms into Casal, Pathbreaker Owlbear, other legendary creatures you control get +2/+2 and gain trample until end of turn.";
const UPKEEP_TEXT = "At the beginning of your upkeep, transform Casal.";
const OTHERS = { type: "creature", supertype: "legendary", controlledBy: "you" } as const;

export default defineCard({
  name: "Casal, Pathbreaker Owlbear",
  art: "https://cards.scryfall.io/art_crop/back/d/5/d571c367-c786-41f9-9cdb-cb02594fa413.jpg",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Bear"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${TRANSFORM_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: OTHERS, power: 2, toughness: 2, duration: "end-of-turn", exceptSource: true },
          { kind: "grant-keyword-all", filter: OTHERS, keyword: "trample", duration: "end-of-turn", exceptSource: true },
        ],
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Casal, Lurkwood Pathfinder", "Casal, Pathbreaker Owlbear"],
  transform: true,
});
