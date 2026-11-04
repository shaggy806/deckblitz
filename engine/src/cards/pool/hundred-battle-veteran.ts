import { defineCard } from "../define.js";

// EDHREC rank 25522.
//
// Rulings:
//   [2025-04-04] Finality counters aren’t keyword counters, and a finality counter doesn’t give
//     any abilities to the permanent it’s on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2025-04-04] Finality counters don’t stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner’s hand from the battlefield, it does so normally.
//   [2025-04-04] If a permanent with a finality counter on it would be put into a graveyard from
//     the battlefield, exile it instead.
//   [2025-04-04] Multiple finality counters on a single permanent are redundant.
//   [2025-04-04] If Hundred-Battle Veteran is countered after being cast from your graveyard, it
//     will return to your graveyard. It may be cast this way again. (That doesn’t count as one of
//     the hundred battles.)
//   [2025-04-04] Once you begin casting a spell from your graveyard, it immediately moves to the
//     stack. Players can’t take any actions until you’ve finished casting the spell.
//   [2025-04-04] You still pay all costs and obey timing restrictions when casting Hundred-Battle
//     Veteran from your graveyard with the permission from its last ability.

export default defineCard({
  name: "Hundred-Battle Veteran",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 4,
  toughness: 2,
  text: "As long as there are three or more different kinds of counters among creatures you control, this creature gets +2/+4.\nYou may cast this card from your graveyard. If you do, it enters with a finality counter on it. (If a creature with a finality counter on it would die, exile it instead.)",
  castSelfFromGraveyard: {},
  static: [
    {
      affects: { scope: "self" },
      // Its own counters are among them, so the static's skipping itself is undone.
      condition: {
        kind: "aggregate",
        value: { aggregate: "distinct", of: "counter-kind", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 3 },
        countsSelf: true,
      },
      grantPt: [2, 4],
      text: "As long as there are three or more different kinds of counters among creatures you control, this creature gets +2/+4.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "finality", amount: 1 } },
      // "If you do": cast by this permission, not by another card's from a graveyard.
      condition: { kind: "source", filter: { castVia: "graveyard-permission" } },
      text: "You may cast this card from your graveyard. If you do, it enters with a finality counter on it.",
    },
  ],
});
