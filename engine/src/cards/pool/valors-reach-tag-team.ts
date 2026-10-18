import { defineCard } from "../define.js";

const TEXT =
  'Create two 3/2 red and white Warrior creature tokens with "Whenever this token and at least one other creature token attack, put a +1/+1 counter on this token."';

export default defineCard({
  name: "Valor's Reach Tag Team",
  art: "https://cards.scryfall.io/art_crop/back/a/7/a7ac3a39-b6a6-4647-bb6e-e82057704f8b.jpg",
  colors: ["R", "W"],
  types: ["sorcery"],
  text: TEXT,
  effect: { kind: "create-token", token: "Warrior Token (Valor's Reach Tag Team)", count: 2 },
  faces: ["Invasion of Kylem", "Valor's Reach Tag Team"],
  transform: true,
});
