import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 18786. The creatures blocking as
// it resolves are the ones affected (rule 611.2c), as Piety's are.

export default defineCard({
  name: "Hold the Line",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Blocking creatures get +7/+7 until end of turn.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", blocking: true },
    power: 7,
    toughness: 7,
    duration: "end-of-turn",
  },
});
