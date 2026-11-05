import type { EffectAmount } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 25559. One optional slot per opponent seat (Tri-Sentinel's shape);
// X is read as the ability resolves, over your graveyard.

const TEXT =
  "When Hapatra enters, for each opponent, put X -1/-1 counters on up to one target creature that player controls, where X is the greatest mana value among cards in your graveyard.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

const X: EffectAmount = { aggregate: "max", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" };

export default defineCard({
  name: "Hapatra, the Desert Fang",
  manaCost: "{2}{B}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: X },
          { kind: "add-counter", target: 1, counter: "-1/-1", amount: X },
          { kind: "add-counter", target: 2, counter: "-1/-1", amount: X },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
