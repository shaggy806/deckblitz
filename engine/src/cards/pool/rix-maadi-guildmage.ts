import { defineCard } from "../define.js";

// EDHREC rank 25416. Return to Ravnica.
//
// "Target player who lost life this turn" is the `player-with-turn-stat` target over the journal's
// `"life-lost"` turn total, read as the target is chosen and again as it resolves (rule 608.2b).

const SHRINK = "{B}{R}: Target blocking creature gets -1/-1 until end of turn.";
const DRAIN = "{B}{R}: Target player who lost life this turn loses 1 life.";

export default defineCard({
  name: "Rix Maadi Guildmage",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  text: `${SHRINK}\n${DRAIN}`,
  activated: [
    {
      cost: { mana: "{B}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: SHRINK,
    },
    {
      cost: { mana: "{B}{R}", tap: false },
      targets: [{ kind: "player-with-turn-stat", turnStat: "life-lost" }],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: DRAIN,
    },
  ],
});
