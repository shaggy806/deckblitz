import { defineCard } from "../define.js";

// EDHREC rank 12154.
//
// Rulings:
//   [2023-11-10] If no card is revealed, most likely because that player's library is empty, the
//     exploring creature receives a +1/+1 counter.
//   [2023-11-10] If you control two copies of Twists and Turns and a creature you control would
//     explore, instead you scry 1, then scry 1 again, then that creature explores. If you control
//     three copies of Twists and Turns, you'd scry 1 an additional time before that creature
//     explores, and so on.
//   [2023-11-10] Some spells or abilities might cause a creature to explore multiple times in a
//     row. If you reveal a nonland card when a creature explores and leave it on top of your
//     library, then the creature explores again immediately afterwards, you'll reveal the same
//     card again.
//
// The replacement is a `would-explore` (Topography Tracker's) whose `also` — the scry — is done
// first, by its controller (`Game.exploreReplacements`); the exploration isn't replaced again
// (rule 614.5). The transform trigger is Tatyova's "whenever a land you control enters, if you
// control seven or more lands" with Thaumatic Compass's `transform`.

const REPLACEMENT_TEXT = "If a creature you control would explore, instead you scry 1, then that creature explores.";
const ENTERS_TEXT = "When this enchantment enters, target creature you control explores.";
const TRANSFORM_TEXT = "When a land you control enters, if you control seven or more lands, transform this enchantment.";

export default defineCard({
  name: "Twists and Turns",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${REPLACEMENT_TEXT}\n${ENTERS_TEXT}\n${TRANSFORM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-explore",
        filter: { type: "creature", controlledBy: "you" },
        instead: { modify: {}, also: { kind: "scry", amount: 1 } },
      },
      text: REPLACEMENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you", filter: { type: "land", controlledBy: "you" } },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Twists and Turns", "Mycoid Maze"],
  transform: true,
});
