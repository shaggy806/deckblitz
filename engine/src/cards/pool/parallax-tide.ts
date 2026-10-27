import { defineCard } from "../define.js";

// EDHREC rank 21249.
//
// Fading 5 (rule 702.32a) is its two pieces: the enters-with-counters
// replacement and the upkeep trigger, whose "if you can't" is read as it
// resolves. The land is exiled linked to this stint (rule 607.2a), and the
// leaves trigger returns those cards under their owners' control. A land
// exiled by an ability that resolves after the Tide has left isn't linked,
// so it stays in exile — the printed card's well-known interaction.

const FADING = "Fading 5";
const FADING_UPKEEP = "At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.";
const EXILE = "Remove a fade counter from this enchantment: Exile target land.";
const RETURN =
  "When this enchantment leaves the battlefield, each player returns to the battlefield all cards they own exiled with it.";

export default defineCard({
  name: "Parallax Tide",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Fading 5 (This enchantment enters with five fade counters on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n${EXILE}\n${RETURN}`,
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
      targets: ["land"],
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
      text: RETURN,
    },
  ],
});
