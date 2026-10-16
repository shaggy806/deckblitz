import { defineCard } from "../define.js";

// EDHREC rank 11083.
// An intervening "if" (rule 603.4): checked as the trigger would fire and
// again as it resolves. TVA Bureaucrat's "+1/+0 and can't be blocked this
// turn".

const TEXT =
  "At the beginning of combat on your turn, if you control a legendary Assassin, this creature gets +1/+0 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Brotherhood Spy",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { supertype: "legendary", subtype: "Assassin" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
