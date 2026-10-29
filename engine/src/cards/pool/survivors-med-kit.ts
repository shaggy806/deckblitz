import { defineCard } from "../define.js";

// EDHREC rank 13452.
//
// "That hasn't been chosen": this one artifact, over its time on the
// battlefield (`notChosenBefore`), chosen as the ability is activated (rule
// 700.2b).

const TEXT =
  "{1}, {T}: Choose one that hasn't been chosen —\n• Stimpak — Draw a card.\n• Fancy Lads Snack Cakes — Create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\n• RadAway — Target player loses all rad counters. Sacrifice this artifact.";

export default defineCard({
  name: "Survivor's Med Kit",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Stimpak — Draw a card.", effect: { kind: "draw", amount: 1 } },
          {
            text: "Fancy Lads Snack Cakes — Create a Food token.",
            effect: { kind: "create-token", token: "Food Token", count: 1 },
          },
          {
            text: "RadAway — Target player loses all rad counters. Sacrifice this artifact.",
            targets: ["player"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "remove-player-counters", counter: "rad", amount: "all", target: 0 },
                { kind: "sacrifice-source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
