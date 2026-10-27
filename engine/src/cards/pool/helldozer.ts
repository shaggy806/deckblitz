import { defineCard } from "../define.js";

const TEXT = "{B}{B}{B}, {T}: Destroy target land. If that land was nonbasic, untap this creature.";

export default defineCard({
  name: "Helldozer",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Giant"],
  power: 6,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: true },
      targets: ["land"],
      // "Was nonbasic" is read before the destroy, as Molten Rain's is; the
      // untap doesn't depend on the land actually being destroyed.
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { notSupertype: "basic" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "untap", target: "source" },
          ],
        },
        else: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
