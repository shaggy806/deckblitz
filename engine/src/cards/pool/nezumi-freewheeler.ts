import { defineCard } from "../define.js";

// EDHREC rank 23846.

export default defineCard({
  name: "Nezumi Freewheeler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Samurai"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nWhen this creature enters, each player mills three cards. (To mill three cards, a player puts the top three cards of their library into their graveyard.)\n{5}{W/P}: Transform this creature. Activate only as a sorcery. ({W/P} can be paid with either {W} or 2 life.)",
  activated: [
    {
      cost: { mana: "{5}{W/P}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{5}{W/P}: Transform this creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: "When this creature enters, each player mills three cards.",
    },
  ],
  faces: ["Nezumi Freewheeler", "Hideous Fleshwheeler"],
  transform: true,
});
