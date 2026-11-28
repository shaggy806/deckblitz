import { defineCard } from "../define.js";

// EDHREC rank 29538. Dissension.
//
// "The next time damage would be dealt to target creature this turn, destroy
// that creature instead" is a one-shot (`next: true`, rule 615.8 by analogy)
// `replacement-effect` on the target in this stint of it (`object: 0`), its
// `instead` an `{ effect }`: the damage is never dealt (rule 614.6), so what
// it would have done (Demonfire's exile, lifelink) doesn't happen — the
// ruling. A replacement, not prevention: it applies to damage that can't be
// prevented too.

const ATTACKS = "This creature attacks each combat if able.";
const ABILITY = "{B}, Sacrifice this creature: The next time damage would be dealt to target creature this turn, destroy that creature instead.";

export default defineCard({
  name: "Kill-Suit Cultist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 1,
  toughness: 1,
  text: `${ATTACKS}\n${ABILITY}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACKS }],
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        object: 0,
        replacement: { event: "would-deal-damage", instead: { effect: { kind: "destroy", target: 0 } } },
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
