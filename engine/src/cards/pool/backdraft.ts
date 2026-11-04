import { defineCard } from "../define.js";

// Neither is a target: the player and the spell are chosen as it resolves.
export default defineCard({
  name: "Backdraft",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose a player who cast one or more sorcery spells this turn. Backdraft deals damage to that player equal to half the damage dealt by one of those sorcery spells this turn, rounded down.",
  effect: {
    kind: "choose-opponent",
    anyPlayer: true,
    whoIf: {
      kind: "of-player",
      player: "that-player",
      condition: { kind: "cast-this-turn", filter: { type: "sorcery" } },
    },
    then: {
      kind: "choose-value",
      value: "spell-damage",
      among: { type: "sorcery" },
      prompt: "Choose one of those sorcery spells",
      then: { kind: "damage", who: "that-player", amount: { half: "x", round: "down" } },
    },
  },
});
