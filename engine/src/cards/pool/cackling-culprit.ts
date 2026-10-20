import { defineCard } from "../define.js";

// The back face of Panicked Bystander.
const DIES_TEXT = "Whenever this creature or another creature you control dies, you gain 1 life.";
const DEATHTOUCH_TEXT = "{1}{B}: This creature gains deathtouch until end of turn.";

export default defineCard({
  name: "Cackling Culprit",
  art: "https://cards.scryfall.io/art_crop/back/0/3/031c5cff-e579-432a-bcee-864b12eb0558.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 5,
  text: `${DIES_TEXT}\n${DEATHTOUCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Panicked Bystander", "Cackling Culprit"],
  transform: true,
});
