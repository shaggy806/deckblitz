import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 28031.
//
// Rulings:
//   [2004-10-04] The ability triggers on the declaration of blockers if no blockers are declared
//     for it.
//   [2008-10-01] If you lose control of Orcish Squatters before its ability resolves, you won’t
//     gain control of the targeted land at all.
//   [2013-04-15] An ability that triggers when something “attacks and isn’t blocked” triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it. It will trigger even if that creature was put
//     onto the battlefield attacking rather than having been declared as an attacker in the
//     declare attackers step.
//
// Floral Spuzzem's shape, with Aladdin's control duration: `whileYouControlSource`
// does nothing when you no longer control Squatters as it resolves (the second
// ruling) — and a Squatters that changed hands has left combat (rule 506.4),
// so the "assigns no combat damage" half can't matter then.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may gain control of target land defending player controls for as long as you control this creature. If you do, this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Orcish Squatters",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { type: "land" } }],
      effect: {
        kind: "may",
        prompt: "Gain control of the targeted land for as long as you control Orcish Squatters? It then assigns no combat damage.",
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
