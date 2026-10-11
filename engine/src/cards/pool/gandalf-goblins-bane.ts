import { defineCard } from "../define.js";

// EDHREC rank 8490.
// An adventurer card: Flameshape is its Adventure, in `flameshape.ts`.

const CAST_TEXT =
  "Whenever you cast a noncreature spell, Gandalf gets +1/+1 until end of turn and deals 1 damage to each opponent.";

export default defineCard({
  name: "Gandalf, Goblins' Bane",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 2,
  toughness: 3,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  faces: ["Gandalf, Goblins' Bane", "Flameshape"],
  adventure: true,
});
