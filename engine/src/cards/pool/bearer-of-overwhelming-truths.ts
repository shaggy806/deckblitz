import { defineCard } from "../define.js";

export default defineCard({
  name: "Bearer of Overwhelming Truths",
  art: "https://cards.scryfall.io/art_crop/back/4/4/440f9f10-6999-4cff-ab98-8aed77813b07.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\nWhenever this creature deals combat damage to a player, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, investigate.",
    },
  ],
  faces: ["Daring Sleuth", "Bearer of Overwhelming Truths"],
  transform: true,
});
