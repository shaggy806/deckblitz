import { defineCard } from "../define.js";

// EDHREC rank 7455.
//
// Rulings:
//   [2024-07-05] Once Lydia Frye has been blocked, increasing the blocking creature’s power to 3
//     or greater won’t cause Lydia Frye to become unblocked.
//   [2024-07-05] The value of X is calculated only once, as Lydia Frye’s last ability resolves.

// X is counted as the trigger resolves (the ruling): tapped Assassins she
// controls, herself among them if tapped.
const END_TEXT =
  "At the beginning of your end step, surveil X, where X is the number of tapped Assassins you control. (Look at the top X cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Lydia Frye",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 2,
  text: `Lydia Frye can't be blocked by creatures with power 3 or greater.\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: { countOf: { subtype: "Assassin", controlledBy: "you", tapped: true } } },
      resolve: null,
      text: END_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: "Lydia Frye can't be blocked by creatures with power 3 or greater.",
    },
  ],
});
