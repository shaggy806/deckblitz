import { defineCard } from "../define.js";

// Back face of Goldbug, Humanity's Ally. "Goldbug and at least one Human attack"
// is part of the trigger condition (Sokka, Lateral Strategist's shape).

const COUNTER_TEXT = "Human spells you control can't be countered.";
const ATTACK_TEXT = "Whenever Goldbug and at least one Human attack, draw a card and convert Goldbug.";

export default defineCard({
  name: "Goldbug, Scrappy Scout",
  art: "https://cards.scryfall.io/art_crop/back/8/e/8e4a8db9-ef57-4ea0-952c-1e5d343fb5d9.jpg",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 1,
  toughness: 3,
  text: `Living metal (During your turn, this Vehicle is also a creature.)\n${COUNTER_TEXT}\n${ATTACK_TEXT}`,
  static: [
    { affects: { scope: "self" }, condition: { kind: "your-turn" }, addTypes: ["creature"], text: "Living metal" },
    { affects: { scope: "self" }, grantsToSpells: { filter: { subtype: "Human" }, cantBeCountered: true }, text: COUNTER_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", subtype: "Human", attacking: true },
        atLeast: 1,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Goldbug, Humanity's Ally", "Goldbug, Scrappy Scout"],
  transform: true,
});
