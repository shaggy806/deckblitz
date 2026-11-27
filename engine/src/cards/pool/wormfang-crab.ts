import { defineCard } from "../define.js";

// Judgment. EDHREC rank 23336. Faceless Butcher's two-trigger exile (rule
// 607.2a), the permanent picked by an opponent: `choose-opponent` (the
// controller picks which, asked only with two or more), then that player's
// `choose-permanents` among what the Crab's controller controls
// (`controlledByPlayer: "you"`, read before the chooser takes over) other than
// the Crab. It isn't targeted, so hexproof and shroud don't stop it. The
// chooser exiles it, but it's exiled with the Crab's trigger, so linked to the
// Crab: if the Crab leaves before the enters trigger resolves, the leaves
// trigger finds nothing and the permanent stays exiled. A token exiled ceases
// to exist and never returns.

const UNBLOCKABLE = "This creature can't be blocked.";
const ENTER_TEXT =
  "When this creature enters, an opponent chooses a permanent you control other than this creature and exiles it.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Wormfang Crab",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Nightmare", "Crab"],
  power: 3,
  toughness: 6,
  text: `${UNBLOCKABLE}\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: UNBLOCKABLE }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        then: {
          kind: "choose-permanents",
          chooser: "that-player",
          controlledByPlayer: "you",
          filter: {},
          exceptSource: true,
          min: 1,
          upTo: 1,
          prompt: "Choose a permanent they control to exile",
          then: { kind: "exile", target: 0, linked: true },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
