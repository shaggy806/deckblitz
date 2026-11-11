import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 5986. The dice are rolled as it enters (rule 614.1c), part of
// the replacement: nobody can respond between the roll and the counters.

const ROLL_TEXT =
  "As this creature enters, roll X d6. It enters with a number of +1/+1 counters on it equal to the total of those results.";

export default defineCard({
  name: "Neverwinter Hydra",
  manaCost: "{X}{X}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `${ROLL_TEXT}\nTrample\nWard {4} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {4}.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        rollAsEnters: { sides: 6, count: "x" },
        counters: { kind: "+1/+1", amount: "rolled-as-enters" },
      },
      text: ROLL_TEXT,
    },
  ],
  triggered: [ward({ mana: "{4}" })],
});
