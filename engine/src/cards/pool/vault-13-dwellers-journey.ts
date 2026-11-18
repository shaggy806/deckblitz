import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 14928.
//
// I: one optional slot per player's seat, yours (seat 0) included, each
// exiled until the Saga leaves (rule 610.3), so nothing is exiled if it has
// left before I resolves (the ruling). III: the controller chooses the two
// cards returned (an Aura with nothing it could enchant can't be one — rule
// 303.4g), under their owners' control (rule 610.3c); then every card still
// exiled with it goes to the bottom of its owner's library at once, each owner
// arranging their own (rule 401.4, the ruling).

const I_TEXT =
  "I — For each player, exile up to one other target enchantment or creature that player controls until this Saga leaves the battlefield.";
const II_TEXT = "II — You gain 2 life and scry 2.";
const III_TEXT =
  "III — Return two cards exiled with this Saga to the battlefield under their owners' control and put the rest on the bottom of their owners' libraries.";

const perPlayer = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "other", of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["enchantment", "creature"] } } },
});

export default defineCard({
  name: "Vault 13: Dweller's Journey",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
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
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "exiled-with-source",
            min: 2,
            max: 2,
            destination: "battlefield",
            under: "owners",
            leftover: "stay",
          },
          { kind: "put-on-libraries", what: { exiledWithSource: true }, position: "bottom" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
