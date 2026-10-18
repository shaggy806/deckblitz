import { defineCard } from "../define.js";

// An opponent's creature dying at the same time as her still triggers it (a
// leaves-the-battlefield ability looks back, rule 603.10a): the counter has
// nothing to go on, but you gain the life (the ruling).

const DIES_TEXT =
  "Whenever a creature an opponent controls dies, put a +1/+1 counter on Grandmother Ravi Sengir and you gain 1 life.";

export default defineCard({
  name: "Grandmother Ravi Sengir",
  art: "https://cards.scryfall.io/art_crop/back/4/9/49ec5e00-22f4-486e-8e99-e950725f6fbc.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Invasion of Ulgrotha", "Grandmother Ravi Sengir"],
  transform: true,
});
