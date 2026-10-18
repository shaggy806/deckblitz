import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 8419.
//
// "This creature or another Phyrexian you control" — two triggers
// (`thisOrAnother`), so its own entry counts even when it isn't a Phyrexian.

const ENTER_TEXT = "Whenever this creature or another Phyrexian you control enters, incubate 2.";

export default defineCard({
  name: "Essence of Orthodoxy",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Phyrexian" } },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    }),
  ],
});
