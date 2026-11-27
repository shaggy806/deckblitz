import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 24186.
//
// Unattaching Shuriken is part of the cost of the equipped creature's
// ability (rule 701.3d): the creature it came off is kept as it was then
// (`{ paid: "unattached-from" }`), so "unless it was unattached from a
// Ninja" asks about that creature at that moment, whatever it is by the time
// the ability resolves. The damage's source is Shuriken (`from: "granter"`),
// as it last existed if it has left. "That creature's controller" is the
// target's, gaining control of Shuriken for good — unattached, it stays so.
const GRANTED =
  "{T}, Unattach Shuriken: Shuriken deals 2 damage to target creature. That creature's controller gains control of Shuriken unless it was unattached from a Ninja.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Shuriken",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, unattach: "granter" },
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 2, target: 0, from: "granter" },
              {
                kind: "conditional",
                condition: {
                  kind: "not",
                  of: { kind: "object-matches", object: { paid: "unattached-from" }, filter: { subtype: "Ninja" } },
                },
                then: { kind: "gain-control", target: "granter", untilEndOfTurn: false, who: { controllerOf: 0 } },
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{2}")],
});
