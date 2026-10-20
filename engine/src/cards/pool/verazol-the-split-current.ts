import { defineCard } from "../define.js";

// "For each mana spent to cast it" is the mana its spell was paid with,
// {X} included (Dyadrine's shape; 0 if it wasn't cast). Removing two
// counters is offered only while Verazol is on the battlefield with two to
// remove (Guiding Hydra's shape); the copy follows only if they came off.

const ENTER_TEXT = "Verazol enters with a +1/+1 counter on it for each mana spent to cast it.";
const CAST_TEXT =
  "Whenever you cast a kicked spell, you may remove two +1/+1 counters from Verazol. If you do, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Verazol, the Split Current",
  manaCost: "{X}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${CAST_TEXT} (A copy of a permanent spell becomes a token.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { manaSpentOf: "source" } } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 2 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove two +1/+1 counters from Verazol to copy that spell?",
          effect: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 2 },
          then: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
