import { defineCard } from "../define.js";

// The damage, then one choice of up to X land cards across the hand and the
// graveyard, all put onto the battlefield tapped at once.
const TEXT =
  "Worldsoul's Rage deals X damage to any target. Put up to X land cards from your hand and/or graveyard onto " +
  "the battlefield tapped.";

export default defineCard({
  name: "Worldsoul's Rage",
  manaCost: "{X}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "return-from-graveyard",
        from: "hand-or-graveyard",
        filter: { type: "land" },
        destination: "battlefield",
        count: "x",
        upTo: true,
        enterTapped: true,
      },
    ],
  },
});
