import { defineCard } from "../define.js";

// EDHREC rank 17533.
// The tokens' first strike is part of making them: only these two gain it.
export default defineCard({
  name: "Mardu Charm",
  manaCost: "{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["instant"],
  text: "Choose one —\n• Mardu Charm deals 4 damage to target creature.\n• Create two 1/1 white Warrior creature tokens. They gain first strike until end of turn.\n• Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Mardu Charm deals 4 damage to target creature.",
        targets: ["creature"],
        effect: { kind: "damage", amount: 4, target: 0 },
      },
      {
        text: "Create two 1/1 white Warrior creature tokens. They gain first strike until end of turn.",
        targets: [],
        effect: { kind: "create-token", token: "Warrior Token", count: 2, gainUntilEndOfTurn: ["first-strike"] },
      },
      {
        text: "Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.",
        targets: ["opponent"],
        effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["creature", "land"] } },
      },
    ],
  },
});
