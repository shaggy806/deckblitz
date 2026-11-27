import { defineCard } from "../define.js";

// EDHREC rank 23912.
//
// Rulings:
//   - If the Oyster untaps during the draw step before its ability to add a -1/-1 counter
//     resolves, the -1/-1 counter effect resolves and adds a -1/-1 counter after the -1/-1
//     counters are removed due to being untapped.
//   - Giant Oyster's ability can be activated during your upkeep, and the creature will get a
//     -1/-1 counter during the draw step that follows it.
//   - The activated ability can target only a tapped creature.
//   - Activating the ability creates a continuous effect that works only as long as Giant Oyster
//     remains tapped, a repeating delayed triggered ability that's in effect only as long as Giant
//     Oyster remains tapped, and a delayed triggered ability that triggers when Giant Oyster
//     untaps or when it leaves the battlefield.
//
// The three parts the last ruling names: the "doesn't untap" restriction
// lasting `"while-source-tapped"`; a draw-step watch of `until:
// "while-source-tapped"` (over as the Oyster untaps or leaves, and not set up
// at all if it's already untapped as the ability resolves — rule 611.2b);
// and a once-only watch on the Oyster becoming untapped or leaving (The
// Pandorica's shape). That watch lasts the game, whatever came first, and
// removes **all** -1/-1 counters from that creature, any source's. A
// counter trigger already on the stack still resolves (the first ruling).
const UNTAP_TEXT = "You may choose not to untap this creature during your untap step.";
const DRAW_TEXT =
  "At the beginning of each of your draw steps, put a -1/-1 counter on that creature (for as long as Giant Oyster remains tapped).";
const REMOVE_TEXT =
  "When Giant Oyster leaves the battlefield or becomes untapped, remove all -1/-1 counters from the creature.";
const TAP_TEXT =
  "{T}: For as long as this creature remains tapped, target tapped creature doesn't untap during its controller's untap step, and at the beginning of each of your draw steps, put a -1/-1 counter on that creature. When this creature leaves the battlefield or becomes untapped, remove all -1/-1 counters from the creature.";

export default defineCard({
  name: "Giant Oyster",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Oyster"],
  power: 0,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${TAP_TEXT}`,
  static: [{ affects: { scope: "self" }, mayChooseNotToUntap: true, text: UNTAP_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-source-tapped" },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "step-begins", step: "draw", who: "you" },
              until: "while-source-tapped",
            },
            effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
            text: DRAW_TEXT,
          },
          {
            kind: "delayed-trigger",
            at: {
              whenever: { on: "event", event: "becomes-untapped", who: "self" },
              watching: "source",
              until: "permanent",
              once: true,
              orLeaves: "source",
            },
            effect: { kind: "remove-counter", target: 0, counter: "-1/-1", amount: "all" },
            text: REMOVE_TEXT,
          },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
