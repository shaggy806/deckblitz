import { defineCard } from "../define.js";

// The back face of Conduit of Storms.
const ATTACK_TEXT = "Whenever this creature attacks, add {C}{C} at the beginning of your next main phase this turn.";

export default defineCard({
  name: "Conduit of Emrakul",
  art: "https://cards.scryfall.io/art_crop/back/a/6/a60c3aa0-9c6b-4fb2-8ece-b9a02c64c1cf.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 5,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "your-next-main-phase",
        effect: { kind: "add-mana", mana: "C", amount: 2 },
        text: "Add {C}{C}.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Conduit of Storms", "Conduit of Emrakul"],
  transform: true,
});
