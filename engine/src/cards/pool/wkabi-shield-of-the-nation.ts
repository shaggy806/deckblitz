import { defineCard } from "../define.js";

// EDHREC rank 18215. Marvel Super Heroes Commander.
//
// Once per declaration that includes your commander — one you own (rule
// 903.3), whoever controls it — with an intervening "if" (rule 603.4) asked
// as the attack is declared and again as it resolves.
const RHINO_TEXT =
  "Whenever you attack with your commander, if you control an artifact with mana value 4 or greater, create a 4/4 green Rhino creature token with trample.";

export default defineCard({
  name: "W'Kabi, Shield of the Nation",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${RHINO_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { isCommander: true, ownedBy: "you" } },
      condition: { kind: "controls", filter: { type: "artifact", manaValue: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Rhino Token", count: 1 },
      resolve: null,
      text: RHINO_TEXT,
    },
  ],
});
