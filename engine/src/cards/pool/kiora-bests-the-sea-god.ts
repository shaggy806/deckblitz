import { defineCard } from "../define.js";

export default defineCard({
  name: "Kiora Bests the Sea God",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Create an 8/8 blue Kraken creature token with hexproof.\nII — Tap all nonland permanents target opponent controls. They don't untap during their controller's next untap step.\nIII — Gain control of target permanent an opponent controls. Untap it.",
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Kraken Token (Kiora Bests the Sea God)", count: 1 },
      resolve: null,
      text: "I — Create an 8/8 blue Kraken creature token with hexproof.",
    },
    {
      at: [2],
      targets: ["opponent"],
      // Those already tapped don't untap either (the rulings); what comes
      // under that player's control later untaps as normal.
      effect: {
        kind: "tap-all",
        filter: { notTypes: ["land"], controlledBy: "you" },
        controlledByTarget: 0,
        doesntUntapNext: true,
      },
      resolve: null,
      text: "II — Tap all nonland permanents target opponent controls. They don't untap during their controller's next untap step.",
    },
    {
      at: [3],
      targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: "III — Gain control of target permanent an opponent controls. Untap it.",
    },
  ],
});
