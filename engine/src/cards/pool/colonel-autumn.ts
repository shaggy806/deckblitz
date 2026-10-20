import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 8266.
//
// "Other legendary creatures you control have exploit" grants the exploit
// ability: the granted creature is its source, so it's the one that exploits
// (rule 702.110b) — what "whenever a creature you control exploits a
// creature" watches. Autumn gone as an exploit ability resolves, nothing
// triggers (the ruling).

const GRANT_TEXT = "Other legendary creatures you control have exploit.";
const COUNTERS_TEXT =
  "Whenever a creature you control exploits a creature, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Colonel Autumn",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\nExploit (When this creature enters, you may sacrifice a creature.)\n${GRANT_TEXT}\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", supertype: "legendary", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [exploit()],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "you-control" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
