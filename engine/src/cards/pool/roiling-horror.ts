import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 27333.
//
// The CDA (rule 604.3) is a `difference`: its owner's life total minus the
// greatest life total among their opponents still in the game, read in every
// zone — negative when an opponent has more (rule 107.1b), so it dies to the
// state-based check while behind. Suspend X with X at least 1 is Aeon
// Chronicler's `suspend: { n: "x" }`; the drain triggers per time counter
// removed while it's suspended.

const CDA_TEXT =
  "Roiling Horror's power and toughness are each equal to your life total minus the life total of an opponent with the most life.";
const SUSPEND_TEXT =
  "Suspend X—{X}{B}{B}{B}. X can't be 0. (Rather than cast this card from your hand, you may pay {X}{B}{B}{B} and exile it with X time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)";
const DRAIN_TEXT =
  "Whenever a time counter is removed from this card while it's exiled, target player loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Roiling Horror",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 0,
  toughness: 0,
  text: `${CDA_TEXT}\n${SUSPEND_TEXT}\n${DRAIN_TEXT}`,
  suspend: { n: "x", cost: "{X}{B}{B}{B}" },
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: {
          difference: [
            "your-life-total",
            { amongPlayers: "greatest", of: { lifeTotal: "each" }, who: "each-opponent" },
          ],
        },
        plusPower: 0,
        plusToughness: 0,
      },
      text: CDA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", perCounter: true },
      whileSuspended: true,
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
