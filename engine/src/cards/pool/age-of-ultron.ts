import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 14115. Marvel Super Heroes Commander.
//
// I — one optional slot per opponent seat (Hammers of Moradin's shape),
// destroyed as one instruction (`simultaneous`). II — one token per opponent
// (Chittering Witch's count). III — the artifact creatures you control as
// it resolves gain deathtouch and each get a counter; "each of them" is the
// same set, so two mass effects over one filter.
const CHAPTER_I = "I — For each opponent, destroy up to one target nonartifact creature that player controls.";
const CHAPTER_II = "II — For each opponent, you create a 2/2 colorless Robot Villain artifact creature token.";
const CHAPTER_III =
  "III — Artifact creatures you control gain deathtouch until end of turn. Put a +1/+1 counter on each of them.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature", notTypes: ["artifact"] } },
});
const ARTIFACT_CREATURES = { types: ["artifact", "creature"], controlledBy: "you" } as const;

export default defineCard({
  name: "Age of Ultron",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
          { kind: "destroy", target: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "create-token", token: "Robot Villain Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: ARTIFACT_CREATURES, keyword: "deathtouch", duration: "end-of-turn" },
          { kind: "add-counter-all", filter: ARTIFACT_CREATURES, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
