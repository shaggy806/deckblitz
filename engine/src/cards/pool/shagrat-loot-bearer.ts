import { defineCard } from "../define.js";

const TEXT =
  "Whenever Shagrat attacks, attach up to one target Equipment to it. Then amass Orcs X, where X is the number of Equipment attached to Shagrat. (Control of the Equipment doesn't change. To amass Orcs X, put X +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)";

// EDHREC rank 15836. X counted after the attach, reading him as he last
// existed if he's gone (`wasAttachedTo`).
export default defineCard({
  name: "Shagrat, Loot Bearer",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Soldier"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { subtype: "Equipment" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "attach", target: "source", attachment: 0 },
          { kind: "amass", amount: { countOf: { subtype: "Equipment", wasAttachedTo: "source" } }, creatureType: "Orc" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
