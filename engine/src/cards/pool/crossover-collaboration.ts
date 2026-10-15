import { defineCard } from "../define.js";

// EDHREC rank 20196.
//
// Teamwork (rule 702.194) is an optional additional cost; "if this spell was
// cast using teamwork" is the spell being kicked, whose effect adds the
// Treasure after the same impulse exile.
const IMPULSE = { kind: "impulse-exile", amount: 2, duration: "your-next-turn" } as const;

export default defineCard({
  name: "Crossover Collaboration",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Teamwork 2 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 2 or more.)\nExile the top two cards of your library. Until the end of your next turn, you may play those cards. If this spell was cast using teamwork, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  targets: [],
  effect: IMPULSE,
  kicker: {
    cost: "",
    keyword: "teamwork",
    teamwork: 2,
    effect: { kind: "sequence", effects: [IMPULSE, { kind: "create-token", token: "Treasure Token", count: 1 }] },
  },
});
