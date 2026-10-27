import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 12061.
//
// Fading 5 (rule 702.32) as its two pieces: the enters-with replacement and
// the upkeep trigger (Cocoon's shape — "if you can't" is no fade counter
// left). The exile is linked to this stint (rule 607.2a), as Admonition
// Angel's: if the Wave leaves before an exile ability resolves, the return
// comes first and that creature stays exiled for good.

const FADING = "Fading 5";
const FADING_UPKEEP =
  "(This enchantment enters with five fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)";
const EXILE = "Remove a fade counter from this enchantment: Exile target creature.";
const LEAVES =
  "When this enchantment leaves the battlefield, each player returns to the battlefield all cards they own exiled with it.";

export default defineCard({
  name: "Parallax Wave",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${FADING} ${FADING_UPKEEP}\n${EXILE}\n${LEAVES}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 5 } },
      text: FADING,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "fade", count: 1 } },
      targets: ["creature"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVES,
    },
  ],
});
