import { defineCard } from "../define.js";

const ATTACK = "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of creature cards in defending player's graveyard.";

export default defineCard({
  name: "Animus of Night's Reach",
  art: "https://cards.scryfall.io/art_crop/back/4/e/4ec18bf7-bd80-408d-acc4-ffaaf7ef6b5b.jpg",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countInGraveyard: { type: "creature", ownedBy: "you" }, forPlayer: "trigger-player" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
  faces: ["The Long Reach of Night", "Animus of Night's Reach"],
  transform: true,
});
