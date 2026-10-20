import { defineCard } from "../define.js";

// EDHREC rank 19504. Kaldheim.
//
// An intervening-if (rule 603.4): enchanted or equipped as it becomes tapped,
// and again as the trigger resolves (the ruling).

const TEXT =
  "Whenever this creature becomes tapped, if it's enchanted or equipped, create a 2/1 red Dwarf Berserker creature token.";

export default defineCard({
  name: "Warchanter Skald",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      condition: { kind: "source", filter: { anyOf: [{ enchanted: true }, { equipped: true }] } },
      targets: [],
      effect: { kind: "create-token", token: "Dwarf Berserker Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
