import { defineCard } from "../define.js";

// EDHREC rank 16647.
//
// Rulings:
//   [2025-11-21] Hei Bai's last ability puts all counters that were on Hei Bai onto the target
//     creature, not just his +1/+1 counters.
//   [2025-11-21] If Hei Bai has -1/-1 counters on him when he leaves the battlefield, that ability
//     will include those as well.
//   [2025-11-21] Hei Bai's last ability doesn't cause you to move counters from Hei Bai onto the
//     target creature. Rather, you put the same number of each kind of counter Hei Bai had when he
//     left the battlefield onto the target creature.
//
// "Enters or attacks" is one ability printed as two entries
// (`sameAbilityAs`), each High-Society Hunter's "you may sacrifice another
// …; if you do". The last is Broodguard Elite's.
const SAC_TEXT =
  "Whenever Hei Bai enters or attacks, you may sacrifice another creature or artifact. If you do, put two +1/+1 counters on Hei Bai.";
const LEAVES_TEXT = "When Hei Bai leaves the battlefield, put its counters on target creature you control.";
const sacrifice = {
  kind: "each-player-may",
  who: "you",
  options: [
    { sacrifice: { typesAnyOf: ["creature", "artifact"] }, exceptSource: true, text: "Sacrifice another creature or artifact" },
  ],
  ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
} as const;

export default defineCard({
  name: "Hei Bai, Spirit of Balance",
  manaCost: "{2}{W/B}{W/B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear", "Spirit"],
  power: 3,
  toughness: 3,
  text: `${SAC_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: sacrifice,
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: sacrifice,
      resolve: null,
      text: SAC_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
