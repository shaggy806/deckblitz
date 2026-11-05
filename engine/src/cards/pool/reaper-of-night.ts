import { defineCard } from "../define.js";

// EDHREC rank 24503.

export default defineCard({
  name: "Reaper of Night",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 4,
  toughness: 5,
  text: "Whenever this creature attacks, if defending player has two or fewer cards in hand, it gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, if defending player has two or fewer cards in hand, it gains flying until end of turn.",
      condition: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 2 } },
    },
  ],
  faces: ["Reaper of Night", "Harvest Fear"],
  adventure: true,
});
