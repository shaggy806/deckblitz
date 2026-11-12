import { defineCard } from "../define.js";

// EDHREC rank 11490. The token is Fire Nation Attacks's 2/2 red Soldier with
// firebending 1. "During an opponent's turn" is part of the trigger event.

const ENTER_TEXT =
  "When this enchantment enters, create a 2/2 red Soldier creature token with firebending 1. (Whenever it attacks, add {R}. This mana lasts until end of combat.)";
const CAST_TEXT =
  "Whenever you cast a spell during an opponent's turn, create a 2/2 red Soldier creature token with firebending 1.";
const SOLDIER = "Soldier Token (Fire Nation Attacks)";

export default defineCard({
  name: "Fire Nation Occupation",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: SOLDIER, count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      whileCondition: { kind: "not", of: { kind: "your-turn" } },
      targets: [],
      effect: { kind: "create-token", token: SOLDIER, count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
