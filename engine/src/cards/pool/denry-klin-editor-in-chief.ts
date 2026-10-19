import { defineCard } from "../define.js";

// EDHREC rank 9661. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] Denry Klin, Editor in Chief was printed with a nonstandard wording, and its
//     Oracle text has been updated for consistency. Specifically, its last ability now says
//     "Whenever a nontoken creature enters the battlefield under your control, if Denry has
//     counters on it, put the same number of each kind of counter on that creature." This is not a
//     functional change.
//
// "Enters with your choice of" counter is a choice made as it enters (rule
// 614.1c): `chooseOnEnter`, asked before it moves, then the one matching
// enters-with-counters replacement. The trigger's intervening-if counts every
// kind of counter on Denry, and `put-counters-of` puts the same number of
// each kind (rule 122.8 — not a move), read as Denry last existed if it has
// left.
const ENTERS_TEXT = "Denry Klin enters with your choice of a +1/+1, first strike, or vigilance counter on it.";
const TRIGGER_TEXT =
  "Whenever a nontoken creature you control enters, if Denry Klin has counters on it, put the same number of each kind of counter on that creature.";

const entersWith = (choice: string, kind: string) =>
  ({
    affects: { scope: "self" },
    condition: { kind: "chosen-on-enter", value: choice },
    replacement: { event: "enters-battlefield", counters: { kind, amount: 1 } },
    text: ENTERS_TEXT,
  }) as const;

export default defineCard({
  name: "Denry Klin, Editor in Chief",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["+1/+1", "first strike", "vigilance"],
  static: [entersWith("+1/+1", "+1/+1"), entersWith("first strike", "first-strike"), entersWith("vigilance", "vigilance")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: false, type: "creature" } },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "put-counters-of", of: "source", target: "trigger-object" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
