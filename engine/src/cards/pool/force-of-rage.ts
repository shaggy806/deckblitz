import { defineCard } from "../define.js";

// EDHREC rank 19090.
// Makes Elemental → new token "3/1 Red Elemental Token" (scaffolded).

export default defineCard({
  name: "Force of Rage",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "If it's not your turn, you may exile a red card from your hand rather than pay this spell's mana cost.\nCreate two 3/1 red Elemental creature tokens with trample and haste. Sacrifice those tokens at the beginning of your next upkeep.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["R"] }, text: "a red card" }, condition: { kind: "not", of: { kind: "your-turn" } } },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "3/1 Red Elemental Token", count: 2 },
      {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        about: "created",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: 0 },
            { kind: "sacrifice-target", target: 1 },
          ],
        },
        text: "Sacrifice those tokens.",
      },
    ],
  },
});
