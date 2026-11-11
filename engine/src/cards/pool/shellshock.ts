import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 9999. One optional slot per opponent's seat; the damage is one
// event, then a Mutagen for each of those creatures actually dealt damage
// (none for a prevented hit or X of 0).
const TEXT =
  "For each opponent, choose up to one target creature that player controls. Shellshock deals X damage to each of those creatures. You create a Mutagen token for each creature dealt damage this way. (They're artifacts with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});
const mutagenIfDamaged = (slot: number) =>
  ({
    kind: "conditional",
    condition: { kind: "damage-dealt-this-way", to: slot },
    then: { kind: "create-token", token: "Mutagen Token", count: 1 },
  }) as const;

export default defineCard({
  name: "Shellshock",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "damage", amount: "x", target: 1 },
          { kind: "damage", amount: "x", target: 2 },
        ],
      },
      mutagenIfDamaged(0),
      mutagenIfDamaged(1),
      mutagenIfDamaged(2),
    ],
  },
});
