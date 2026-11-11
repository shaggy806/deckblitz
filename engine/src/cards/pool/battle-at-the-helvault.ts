import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 6453. One optional slot per player's seat, yours (seat 0)
// included; each exiled until the Saga leaves, so they return as it's
// sacrificed after III (a token exiled is gone for good — the ruling).
const I_II_TEXT =
  "I, II — For each player, exile up to one target non-Saga, nonland permanent that player controls until this Saga leaves the battlefield.";
const III_TEXT = "III — Create Avacyn, a legendary 8/8 white Angel creature token with flying, vigilance, and indestructible.";

const perPlayer = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"], notSubtypes: ["Saga"] } },
});

export default defineCard({
  name: "Battle at the Helvault",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [perPlayer(0), perPlayer(1), perPlayer(2), perPlayer(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "exile", target: 1, untilSourceLeaves: true },
          { kind: "exile", target: 2, untilSourceLeaves: true },
          { kind: "exile", target: 3, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: I_II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "create-token", token: "Avacyn Token", count: 1 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
