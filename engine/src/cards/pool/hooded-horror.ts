import { defineCard } from "../define.js";

// Commander 2013. "The most creatures or tied for the most": at least as many
// as each other player, the defending player being the one it attacks (rule
// 802.2a).

const TEXT =
  "This creature can't be blocked as long as defending player controls the most creatures or is tied for the most.";

export default defineCard({
  name: "Hooded Horror",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "of-player",
        player: "defending-player",
        condition: {
          kind: "player-compare",
          stat: { controls: { type: "creature" } },
          compare: "at-least",
          than: "each-opponent",
        },
      },
      grantKeywords: ["unblockable"],
      text: TEXT,
    },
  ],
});
