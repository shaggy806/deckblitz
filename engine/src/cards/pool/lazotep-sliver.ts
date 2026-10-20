import { defineCard } from "../define.js";

// EDHREC rank 7323.
//
// Afflict 2 granted (rule 702.130: a triggered ability — Frontline
// Devastator's), and amass Slivers 2 (701.47 — the Army is a Sliver too).
const AFFLICT_TEXT = "Sliver creatures you control have afflict 2.";
const AMASS_TEXT = "Whenever a nontoken Sliver you control dies, amass Slivers 2.";

export default defineCard({
  name: "Lazotep Sliver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Sliver"],
  power: 4,
  toughness: 4,
  text: `${AFFLICT_TEXT} (Whenever a creature with afflict 2 becomes blocked, defending player loses 2 life.)\n${AMASS_TEXT} (Put two +1/+1 counters on an Army you control. It's also a Sliver. If you don't control an Army, create a 0/0 black Sliver Army creature token first.)`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "becomes-blocked", who: "self" },
          targets: [],
          effect: { kind: "lose-life", amount: 2, who: "trigger-player" },
          resolve: null,
          text: "Afflict 2",
        },
      ],
      text: AFFLICT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Sliver", token: false } },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Sliver" },
      resolve: null,
      text: AMASS_TEXT,
    },
  ],
});
