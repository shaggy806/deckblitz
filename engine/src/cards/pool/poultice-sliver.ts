import { defineCard } from "../define.js";

// Planar Chaos (PLC). Crypt Sliver's shape with a {2}: every Sliver, whoever
// controls it, has the ability as its own.
const GRANT = "{2}, {T}: Regenerate target Sliver.";
const TEXT = `All Slivers have "${GRANT}"`;

export default defineCard({
  name: "Poultice Sliver",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (The next time that Sliver would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: [{ kind: "permanent", filter: { subtype: "Sliver" } }],
          effect: { kind: "regenerate", target: 0 },
          resolve: null,
          text: GRANT,
        },
      ],
      text: TEXT,
    },
  ],
});
