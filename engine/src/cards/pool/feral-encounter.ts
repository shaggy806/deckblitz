import { defineCard } from "../define.js";

// Rulings:
//   - If you cast Feral Encounter and no combat phases occur later in that turn, the delayed
//     triggered ability won't trigger.
//   - Casting Feral Encounter doesn't require any targets. As you put the delayed triggered ability
//     on the stack at the beginning of the next combat phase this turn, you choose the target
//     creature you control and up to one target creature you don't control.
//
// The delayed ability waits for this turn's next beginning of combat step (rule 506.1; lapsing
// with the turn — `which: "this-turn"`) and chooses its own targets as it's put on the stack (rule
// 603.3d — `DelayedAt`'s `targets`). The creature you control is the damage's source.

const DELAYED_TEXT =
  "At the beginning of the next combat phase this turn, target creature you control deals damage equal to its power to up to one target creature you don't control.";

export default defineCard({
  name: "Feral Encounter",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Look at the top five cards of your library. You may exile a creature card from among them. Put the rest on the bottom of your library in a random order. You may cast the exiled card this turn. ${DELAYED_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "exile",
        leftover: "bottom-random",
        then: { kind: "grant-play", cards: 0, duration: "end-of-turn" },
      },
      {
        kind: "delayed-trigger",
        at: {
          step: "begin-combat",
          which: "this-turn",
          targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
        },
        effect: { kind: "damage", amount: { powerOf: 0 }, target: 1, from: 0 },
        text: DELAYED_TEXT,
      },
    ],
  },
});
