import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const EXILE_TEXT =
  "When this creature enters, for each opponent, exile up to one target nonland permanent that player controls until this creature leaves the battlefield.";
const X_TEXT = "{X}{W}: Put target card with mana value X exiled with this creature into its owner's graveyard. You gain X life.";

// Rulings:
//   If an exiled permanent card leaves exile, perhaps because of Bronzebeak Foragers's last
//     ability, it won't return to the battlefield after Bronzebeak Foragers leaves the battlefield.
//   If a token is exiled this way, it will cease to exist and won't return to the battlefield.
//   If Bronzebeak Foragers leaves the battlefield before its first ability resolves, none of the
//     target permanents will be exiled.
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Bronzebeak Foragers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 4,
  text: `${EXILE_TEXT}\n${X_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "exile", target: 1, untilSourceLeaves: true },
          { kind: "exile", target: 2, untilSourceLeaves: true },
        ],
      },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{W}", tap: false },
      targets: [{ kind: "card-in-exile", linked: true, filter: { manaValue: { op: "eq", n: "x" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-into-graveyard", target: 0 },
          { kind: "gain-life", amount: "x" },
        ],
      },
      resolve: null,
      text: X_TEXT,
    },
  ],
});
