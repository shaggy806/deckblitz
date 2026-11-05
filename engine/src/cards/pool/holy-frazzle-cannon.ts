import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Invasion of New Capenna's back face. One counter each, however many types a
// creature shares (the ruling); the equipped creature once, whoever controls it.
const ATTACK_TEXT =
  "Whenever equipped creature attacks, put a +1/+1 counter on that creature and each other creature you control that shares a creature type with it.";

export default defineCard({
  name: "Holy Frazzle-Cannon",
  art: "https://cards.scryfall.io/art_crop/back/f/5/f5926c8e-8049-418e-9a84-f8558e5ba9d1.jpg",
  colors: ["W", "B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {1}`,
  activated: [equip("{1}")],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          {
            kind: "for-each-permanent",
            filter: { type: "creature", controlledBy: "you", sharesCreatureTypeWith: "trigger-object" },
            exceptTriggerObject: true,
            simultaneous: true,
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Invasion of New Capenna", "Holy Frazzle-Cannon"],
  transform: true,
});
