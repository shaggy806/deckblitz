import { defineCard } from "../define.js";

// EDHREC rank 26514.
//
// Printed */*. Neither sentence is a characteristic-defining ability: each
// sets its values only while a condition holds (rule 604.3a(5)), so they are
// ordinary statics that work on the battlefield alone, and off it the card is
// 0/0. Attacking, it counts the defending player's Forests
// (`forDefendingPlayer`: the player it attacks, or who defends the
// planeswalker or battle it attacks, rule 506.2); otherwise its controller's.
// The land stays a Forest until this creature leaves the battlefield
// (`"while-source"`, Graceful Antelope's), replacing its land types (rule
// 305.7).

const PT_TEXT =
  "As long as Gaea's Liege isn't attacking, its power and toughness are each equal to the number of Forests you control. As long as Gaea's Liege is attacking, its power and toughness are each equal to the number of Forests defending player controls.";
const TAP_TEXT = "{T}: Target land becomes a Forest until this creature leaves the battlefield.";

export default defineCard({
  name: "Gaea's Liege",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${TAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { inZone: "battlefield", attacking: false } },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      setBasePtFromCount: {
        countOf: { countOf: { subtype: "Forest", controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        forDefendingPlayer: true,
      },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { tap: true },
      targets: ["land"],
      effect: { kind: "become", target: 0, setSubtypes: ["Forest"], duration: "while-source" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
