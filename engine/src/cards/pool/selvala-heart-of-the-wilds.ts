import { defineCard } from "../define.js";

// EDHREC rank 411.
//
// The draw's condition is read as the ability resolves, against every other
// creature on the battlefield then, the new creature as it last existed if it
// has left (the rulings): `greatestInZone`'s `strictly`, since a tie draws
// nothing. Past a list's budget the split is the player's (`manaSplit`).

const DRAW_TEXT =
  "Whenever another creature enters, its controller may draw a card if its power is greater than each other creature's power.";
const MANA_TEXT = "{G}, {T}: Add X mana in any combination of colors, where X is the greatest power among creatures you control.";

export default defineCard({
  name: "Selvala, Heart of the Wilds",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 3,
  text: `${DRAW_TEXT}\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "trigger-object",
          filter: { greatestInZone: { of: "power", among: { type: "creature" }, strictly: true } },
        },
        then: {
          kind: "each-player-may",
          who: "trigger-controller",
          prompt: "Draw a card?",
          effect: { kind: "draw", amount: 1 },
        },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
