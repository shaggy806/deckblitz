import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17161. "Trickster's Talisman" in the granted trigger is the
// Equipment that grants it (rule 201.5a).
const GRANTED =
  "Whenever this creature deals combat damage to a player, you may sacrifice Trickster's Talisman. If you do, create a token that's a copy of this creature.";
const TEXT = `Invoke Duplicity — Equipped creature gets +1/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Trickster's Talisman",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Sacrifice Trickster's Talisman to create a token that's a copy of this creature?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-target", target: "granter" },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "sacrificed" },
                  then: { kind: "create-token-copy", of: "source", count: 1 },
                },
              ],
            },
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
