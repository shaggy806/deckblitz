import { defineCard } from "../define.js";

// The Sleigh isn't attacking, so its "defending player" is any player an
// attacker is attacking, its controller naming one among several (rule
// 802.2a): at least one of them controlling a snow land lets it activate.

const TEXT =
  "{2}, {T}: Target creature gains vigilance until end of turn. Activate only during combat and only if defending player controls a snow land.";

export default defineCard({
  name: "Arcum's Sleigh",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", duringCombat: true },
          {
            kind: "controls",
            filter: { type: "land", supertype: "snow", controlledByDefendingPlayer: true },
            atLeast: 1,
            anyController: true,
          },
        ],
      },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
