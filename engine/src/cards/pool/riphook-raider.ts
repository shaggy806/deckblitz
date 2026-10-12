import { defineCard } from "../define.js";

export default defineCard({
  name: "Riphook Raider",
  art: "https://cards.scryfall.io/art_crop/back/5/4/54a4b031-0919-44aa-a35e-68da7a27235a.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 4,
  keywords: ["nightbound"],
  text: "This creature can't be blocked by creatures with power 2 or less.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
  faces: ["Hookhand Mariner", "Riphook Raider"],
  transform: true,
});
