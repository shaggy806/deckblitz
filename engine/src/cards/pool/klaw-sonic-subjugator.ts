import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Sonic Attack — When Klaw enters, target player reveals a number of cards from their hand equal to one plus the number of creature cards in your graveyard. You choose one of them. That player discards that card.";

export default defineCard({
  name: "Klaw, Sonic Subjugator",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        reveals: { sum: [1, { countInGraveyard: { type: "creature", ownedBy: "you" } }] },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
