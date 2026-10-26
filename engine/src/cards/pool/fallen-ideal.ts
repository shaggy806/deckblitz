import { defineCard } from "../define.js";

const GRANTED_TEXT = "Sacrifice a creature: This creature gets +2/+1 until end of turn.";
const GRANT_TEXT = `Enchanted creature has flying and "${GRANTED_TEXT}"`;
const RETURN_TEXT = "When this Aura is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Fallen Ideal",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      // The granted ability is the creature's own, so its controller (not
      // the Aura's) activates it and sacrifices one of their creatures.
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      grantsActivated: [
        {
          cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
