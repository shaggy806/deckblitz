import { defineCard } from "../define.js";

// EDHREC rank 15824. Morningtide.
//
// Reinforce (rule 702.77a) is an ability from the hand, paid by discarding the
// card — Bannerhide Krushok's shape.
const REINFORCE_TEXT =
  "Reinforce 3—{3}{G} ({3}{G}, Discard this card: Put three +1/+1 counters on target creature.)";

export default defineCard({
  name: "Hunting Triad",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["kindred", "sorcery"],
  subtypes: ["Elf"],
  text: `Create three 1/1 green Elf Warrior creature tokens.\n${REINFORCE_TEXT}`,
  targets: [],
  effect: { kind: "create-token", token: "Elf Warrior Token", count: 3 },
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: REINFORCE_TEXT,
    },
  ],
});
