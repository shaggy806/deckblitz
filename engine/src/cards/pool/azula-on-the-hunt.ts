import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 8817. Firebending 2 and the Clue trigger are two triggered
// abilities on the same attack, ordered by their controller. The Clue is
// created, not investigated (the ruling).
const FIREBENDING_TEXT =
  "Firebending 2 (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)";
const ATTACK_TEXT = "Whenever Azula attacks, you lose 1 life and create a Clue token.";

export default defineCard({
  name: "Azula, On the Hunt",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 3,
  text: `${FIREBENDING_TEXT}\nWhenever Azula attacks, you lose 1 life and create a Clue token. (It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  triggered: [
    firebending(2, FIREBENDING_TEXT),
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1 },
          { kind: "create-token", token: "Clue Token", count: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
