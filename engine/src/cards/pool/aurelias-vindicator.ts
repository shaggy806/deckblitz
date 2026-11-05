import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 14742. X is announced as it's turned face up for its disguise
// cost; turned up any other way, it's 0. A creature target that dies first is
// an illegal target (its ruling). Exiled with Vindicator even if it has left
// by then, so nothing brings those back (its ruling).
const UP_TEXT =
  "When this creature is turned face up, exile up to X other target creatures from the battlefield and/or creature cards from graveyards.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled cards to their owners' hands.";

export default defineCard({
  name: "Aurelia's Vindicator",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink, ward {2}\nDisguise {X}{3}{W}\n${UP_TEXT}\n${LEAVES_TEXT}`,
  morph: { keyword: "disguise", cost: "{X}{3}{W}" },
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "other",
            of: {
              kind: "one-of",
              of: ["creature", { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
            },
          },
          max: { triggerValue: true },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: UP_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
