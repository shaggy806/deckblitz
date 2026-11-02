import { defineCard } from "../define.js";

const TEXT =
  "Whenever Rankle and Torbran deals combat damage to a player or battle, choose any number —\n" +
  "• Each player creates a Treasure token.\n" +
  "• Each player sacrifices a creature of their choice.\n" +
  "• If a source would deal damage to a player or battle this turn, it deals that much damage plus 2 instead.";

export default defineCard({
  name: "Rankle and Torbran",
  manaCost: "{1}{B}{B}{R}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Faerie", "Dwarf"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "first-strike", "haste"],
  text: `Flying, first strike, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 0,
        maxModes: 3,
        modes: [
          {
            text: "Each player creates a Treasure token.",
            effect: { kind: "create-token", token: "Treasure Token", count: 1, who: "each-player" },
          },
          {
            text: "Each player sacrifices a creature of their choice.",
            effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
          },
          {
            text: "If a source would deal damage to a player or battle this turn, it deals that much damage plus 2 instead.",
            effect: {
              kind: "player-effect",
              duration: "end-of-turn",
              damageReplacement: { plus: 2, to: "player-or-battle" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
