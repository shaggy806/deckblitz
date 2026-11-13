import { defineCard } from "../define.js";

// EDHREC rank 4207. `reveal-until-count`'s `put: "graveyard"`; the cast
// trigger reads the X chosen, and resolves even if the spell is countered in
// response (its rulings). The rest go to the bottom at random.
const CAST_TEXT =
  "When you cast this spell, reveal cards from the top of your library until you reveal X creature cards. " +
  "Put all creature cards revealed this way into your graveyard, then put the rest on the bottom of your library in a random order.";
const PT_TEXT = "Old Stickfingers's power and toughness are each equal to the number of creature cards in your graveyard.";

export default defineCard({
  name: "Old Stickfingers",
  manaCost: "{X}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  text: `${CAST_TEXT}\n${PT_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "reveal-until-count",
        filter: { type: "creature" },
        count: "x",
        put: "graveyard",
        rest: "bottom-random",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { type: "creature", ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
});
