import { defineCard } from "../define.js";

// EDHREC rank 28106.
//
// Rulings:
//   If put onto the battlefield without casting it from your hand, X will be zero.
//   Once on the battlefield, the X is considered to be zero when calculating its mana cost.
//   If damage that would be dealt to Rock Hydra can't be prevented, you still remove a +1/+1
//     counter from it for each 1 damage dealt.
//   You can activate the activated ability that prevents damage any time, even if no source
//     seems likely to deal damage to you in the near future. It will prevent the next 1 damage
//     that would be dealt this turn, even if that turns out to be much later in the turn.
//
// "For each 1 damage … if it has a +1/+1 counter on it, remove a +1/+1 counter from it and
// prevent that 1 damage" is `prevent: { perCounter: "+1/+1" }`: as much as it has counters,
// one removed for each 1, and one for each 1 of damage that can't be prevented (the ruling).
const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";
const DAMAGE_TEXT =
  "For each 1 damage that would be dealt to this creature, if it has a +1/+1 counter on it, remove a +1/+1 counter from it and prevent that 1 damage.";
const PREVENT_TEXT = "{R}: Prevent the next 1 damage that would be dealt to this creature this turn.";
const GROW_TEXT = "{R}{R}{R}: Put a +1/+1 counter on this creature. Activate only during your upkeep.";

export default defineCard({
  name: "Rock Hydra",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${DAMAGE_TEXT}\n${PREVENT_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "self", instead: { prevent: { perCounter: "+1/+1" } } },
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: PREVENT_TEXT,
    },
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: GROW_TEXT,
    },
  ],
});
