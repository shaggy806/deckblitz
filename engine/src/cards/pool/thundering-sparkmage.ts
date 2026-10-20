import { defineCard } from "../define.js";

// EDHREC rank 27470.
//
// X is the party as the trigger resolves, the Sparkmage (a Wizard) included
// if it's still there (the ruling).

const ENTER_TEXT =
  "When this creature enters, it deals X damage to target creature or planeswalker, where X is the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)";

export default defineCard({
  name: "Thundering Sparkmage",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: { kind: "damage", amount: { partySize: "you" }, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
