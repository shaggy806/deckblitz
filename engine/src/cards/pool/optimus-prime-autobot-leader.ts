import { defineCard } from "../define.js";

// "The chosen creature" is the one bolster chose (rule 701.39a): `thisWay:
// "chosen"`, read for the trample and the delayed "when that creature deals combat
// damage to a player this turn" (`watching`, `once`).

const ATTACK_TEXT =
  "Whenever you attack, bolster 2. The chosen creature gains trample until end of turn. When that creature deals combat damage to a player this turn, convert Optimus Prime.";

export default defineCard({
  name: "Optimus Prime, Autobot Leader",
  art: "https://cards.scryfall.io/art_crop/back/f/0/f04ed2cc-aae1-400b-9cc5-5d4e3e3dd714.jpg",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 8,
  keywords: ["trample"],
  text: `Living metal (During your turn, this Vehicle is also a creature.)\nTrample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "bolster", amount: 2 },
          { kind: "grant-keyword", target: { thisWay: "chosen" }, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "deals-combat-damage-to-player", who: "self" },
              watching: { thisWay: "chosen" },
              once: true,
            },
            effect: { kind: "transform", target: "source" },
            text: "When that creature deals combat damage to a player this turn, convert Optimus Prime.",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      addTypes: ["creature"],
      text: "Living metal",
    },
  ],
  faces: ["Optimus Prime, Hero", "Optimus Prime, Autobot Leader"],
  transform: true,
});
