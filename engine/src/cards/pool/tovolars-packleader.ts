import { defineCard } from "../define.js";

const TOKENS_TEXT = "Whenever this creature enters or attacks, create two 2/2 green Wolf creature tokens.";
const FIGHT_TEXT = "{2}{G}{G}: Another target Wolf or Werewolf you control fights target creature you don't control.";

export default defineCard({
  name: "Tovolar's Packleader",
  art: "https://cards.scryfall.io/art_crop/back/3/9/3983a304-5040-4b8d-945a-bf4ede3104a8.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 7,
  toughness: 7,
  keywords: ["nightbound"],
  text: `${TOKENS_TEXT}\n${FIGHT_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [
        { kind: "other", of: { kind: "permanent", whose: "you", filter: { subtypes: ["Wolf", "Werewolf"] } } },
        "creature-an-opponent-controls",
      ],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: FIGHT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
  ],
  faces: ["Tovolar's Huntmaster", "Tovolar's Packleader"],
  transform: true,
});
