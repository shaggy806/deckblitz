import { defineCard } from "../define.js";

// Commander 2016 (C16). EDHREC rank 15553.
//
// Two different players are chosen as it enters (rule 614.1c; its controller
// may be either), and damage only between them is doubled, either way: a
// source one controls, to the other or a permanent the other controls (rule
// 614.1a), combat or not. Two Bitter Feuds on the same pair double it twice
// (the rulings); the player dealt damage (or the permanent's controller)
// orders it against other modifications (616.1).
const DOUBLE_TEXT =
  "If a source controlled by one of the chosen players would deal damage to the other chosen player or a permanent that player controls, that source deals double that damage to that player or permanent instead.";

export default defineCard({
  name: "Bitter Feud",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  choosePlayerOnEnter: "player",
  chooseTwoPlayersOnEnter: true,
  text: `As this enchantment enters, choose two players.\n${DOUBLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "between-chosen-players", instead: { modify: { times: 2 } } },
      text: DOUBLE_TEXT,
    },
  ],
});
