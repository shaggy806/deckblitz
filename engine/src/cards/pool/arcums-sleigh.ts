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
          // Every opponent of the active player is a defending player from the start of
          // combat, attackers or not (rules 506.2, 802.2), and any one of them will do (802.2a).
          {
            kind: "of-player",
            player: "active-player",
            condition: {
              kind: "of-player",
              player: "an-opponent",
              condition: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 },
            },
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
