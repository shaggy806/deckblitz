import { defineCard } from "../define.js";

/** 4/1 black Skeleton with menace — Gut, True Soul Zealot's token. */
export default defineCard({
  name: "Skeleton Token (Gut, True Soul Zealot)",
  art: "cf4c245f-af2f-46a7-81f3-670a04940901",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 4,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
});
