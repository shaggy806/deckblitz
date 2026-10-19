import { defineCard } from "../define.js";

// EDHREC rank 11689.
//
// Rulings:
//   [2022-10-14] Being a Dragon isn't part of the activated ability the enchanted creature has.
//     It's a Dragon in addition to its other types whether or not that ability has been activated.
//
// The granted ability's `source` is the creature that has it (Dragon Mantle's shape). "This
// card" is the Aura followed into the graveyard it went to as its creature died: its trigger goes
// on the stack after state-based actions put it there, so a card gone from that graveyard (or one
// exiled instead) stays where it is (Rancor's return, rule 400.7).

const PUMP_TEXT = "{1}: This creature gets +1/+0 until end of turn.";
const STATIC_TEXT =
  `Enchanted creature gets +1/+1 and has flying, haste, and "${PUMP_TEXT}" ` +
  "It's a Dragon in addition to its other types.";
const RETURN_TEXT = "When enchanted creature dies, return this card to its owner's hand.";

export default defineCard({
  name: "Draconic Destiny",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying", "haste"],
      addSubtypes: ["Dragon"],
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
