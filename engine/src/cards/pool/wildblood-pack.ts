import { defineCard } from "../define.js";

const ATTACK_TEXT = "Attacking creatures you control get +3/+0.";

export default defineCard({
  name: "Wildblood Pack",
  art: "https://cards.scryfall.io/art_crop/back/b/b/bb90a6f1-c7f2-4c2e-ab1e-59c5c7937841.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [3, 0],
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Instigator Gang", "Wildblood Pack"],
  transform: true,
});
