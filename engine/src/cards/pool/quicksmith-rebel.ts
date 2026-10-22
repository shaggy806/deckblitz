import { defineCard } from "../define.js";
import type { ActivatedAbility } from "../../abilities.js";

// EDHREC rank 26916.
//
// The grant lasts "while-you-control-source": it never begins if this
// creature has left or changed hands by the time the ability resolves, and
// ends for good once it does (rule 611.2b; the rulings).
//
// Rulings:
//   [2017-02-09] If Quicksmith Rebel leaves the battlefield while its ability is on the stack, the
//     artifact never gains the damage-dealing ability.
//   [2017-02-09] If another player gains control of Quicksmith Rebel, the artifact will no longer
//     have the damage-dealing ability, even if you regain control of Quicksmith Rebel.
//   [2017-02-09] If Quicksmith Rebel or the artifact leaves the battlefield while the
//     damage-dealing ability is on the stack, that ability resolves as normal.

const PING: ActivatedAbility = {
  cost: { mana: null, tap: true },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  resolve: null,
  text: "{T}: This artifact deals 2 damage to any target.",
};

const TEXT =
  'When this creature enters, target artifact you control gains "{T}: This artifact deals 2 damage to any target" for as long as you control this creature.';

export default defineCard({
  name: "Quicksmith Rebel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: { kind: "grant-activated", target: 0, ability: PING, duration: "while-you-control-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
