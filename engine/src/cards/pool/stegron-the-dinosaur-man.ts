import { defineCard } from "../define.js";

// EDHREC rank 17954.
//
// A hand ability whose cost discards the card (channel's shape, `zone: "hand"`).

const FORMULA_TEXT =
  "Dinosaur Formula — {1}{R}, Discard this card: Until end of turn, target creature you control gets +3/+1 and becomes a Dinosaur in addition to its other types.";

export default defineCard({
  name: "Stegron the Dinosaur Man",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Villain"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${FORMULA_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
          { kind: "add-types", target: 0, addSubtypes: ["Dinosaur"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FORMULA_TEXT,
      zone: "hand",
    },
  ],
});
