import { defineCard } from "../define.js";

// The Demon Berserker token — Kaldheim's (The Bloodsky Massacre and others).

export default defineCard({
  name: "Demon Berserker Token",
  art: "c58def55-f2ca-4c41-b891-c32e5220fc66",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon", "Berserker"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
});
