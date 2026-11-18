import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 15988.
//
// Rulings:
//   If a copy of a spell (one that has no card representing it) is affected by Ertai's Meddling,
//     the spell ceases to exist when exiled. It will not gain counters and will not be put back on
//     the stack.
//   Ertai's Meddling can't be cast through any way that doesn't pay its mana cost.
//   Once it is put back on the stack, it is a "new" spell again and can be countered or even
//     targeted by another Ertai's Meddling.
//   A delayed spell that targets another spell won't resolve when it resolves since it will find
//     that its target is no longer on the stack.
//   This now exiles the spell as part of Ertai's Meddling's resolution.
//   If the spell was cast using flashback, Ertai's Meddling will still exile it with delay counters
//     on it. When the card is returned to the stack, it still "remembers" the flashback cost was
//     originally paid. It'll be exiled when it resolves or otherwise leaves the stack.
//   Ertai's Meddling has the spell's controller put the spell back onto the stack; it does not have
//     its controller cast the spell again. Anything that triggers off of casting spells won't
//     trigger, and effects that count spells cast or prevent spells from being cast don't see it.
//
// "X can't be 0" is `minX` (which also keeps it from being cast without paying its mana cost).
// The spell's controller exiles it (an `as-player`), the delay counters going on as it arrives;
// a copy ceases to exist and nothing is set up (`about: "exiled"` finds nothing). The upkeep
// ability is a delayed one of Ertai's Meddling (rule 603.7), watching that player's upkeeps
// (`byPlayer`) for as long as the card stays exiled as that object (`while-exiled`, rule 400.7).
// Back on the stack it is the spell it was, every choice kept (`put-on-stack-as-spell`, rule
// 707.10), not cast; a face-down spell comes back a face-up 2/2 with no name or text, and the
// permanent stays one (rule 400.7a, the morph ruling).
const EXILE_TEXT = "Target spell's controller exiles it with X delay counters on it.";
const UPKEEP_TEXT =
  "At the beginning of each of that player's upkeeps, if that card is exiled, remove a delay counter from it. If the card has no delay counters on it, the player puts it onto the stack as a copy of the original spell.";

export default defineCard({
  name: "Ertai's Meddling",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `X can't be 0.\n${EXILE_TEXT}\n${UPKEEP_TEXT}`,
  minX: 1,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "as-player",
        who: { controllerOf: 0 },
        effect: { kind: "exile", target: 0, withCounters: { kind: "delay", amount: "x" } },
      },
      {
        kind: "delayed-trigger",
        about: "exiled",
        at: {
          whenever: { on: "step-begins", step: "upkeep", who: "any" },
          byPlayer: { controllerOf: 0 },
          until: "while-exiled",
        },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: 0, counter: "delay", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { counters: { kind: "delay", compare: { op: "eq", n: 0 } } } },
              then: { kind: "put-on-stack-as-spell", target: 0, by: "active-player" },
            },
          ],
        },
        text: UPKEEP_TEXT,
      },
    ],
  },
});
