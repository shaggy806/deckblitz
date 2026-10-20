import { defineCard } from "../define.js";

/** The nightbound back face of Volatile Arsonist. */
const ATTACK_TEXT =
  "Whenever this creature attacks, it deals 2 damage to each of up to one target creature, up to one target player, and/or up to one target planeswalker.";

export default defineCard({
  name: "Dire-Strain Anarchist",
  art: "https://cards.scryfall.io/art_crop/back/8/7/87a02ac1-c43a-43cc-9c2b-628cfdeb4cbf.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  keywords: ["menace", "haste", "nightbound"],
  text: `Menace, haste\n${ATTACK_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: "player" },
        { kind: "optional", of: { kind: "permanent", filter: { type: "planeswalker" } } },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 2, target: 1 },
          { kind: "damage", amount: 2, target: 2 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Volatile Arsonist", "Dire-Strain Anarchist"],
  transform: true,
});
