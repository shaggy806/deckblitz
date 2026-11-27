import { defineCard } from "../define.js";

// EDHREC rank 25872. "Since your last upkeep" is read in this upkeep, so it's
// the upkeep of your previous turn on (Echo's reading, rule 702.30a): the
// `turn-history` window `since-your-last-upkeep`, over the creature the Aura
// enchants now, in its current stint (`attachedOnly`), whoever controlled it
// as it attacked or blocked. Not an intervening "if": the trigger always
// fires, and adds or removes as it resolves.
const ENTER_TEXT = "When this Aura enters, put six +1/+1 counters on enchanted creature.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, put a +1/+1 counter on enchanted creature if it attacked or blocked since your last upkeep. Otherwise, remove a +1/+1 counter from it.";

const since = (what: "attackers" | "blockers") =>
  ({ kind: "turn-history", what, who: "any-player", window: "since-your-last-upkeep", attachedOnly: true }) as const;

export default defineCard({
  name: "Shape of the Wiitigo",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 6 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "any", of: [since("attackers"), since("blockers")] },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
        else: { kind: "remove-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
