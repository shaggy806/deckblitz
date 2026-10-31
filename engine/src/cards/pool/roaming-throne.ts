import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 133.
//
// Rulings:
//   [2023-11-10] Roaming Throne's last ability doesn't copy the triggered ability; it just causes
//     the ability to trigger an additional time. Any choices made as you put the ability onto the
//     stack, such as modes and targets, are made separately for each instance of the ability. Any
//     choices made on resolution, such as whether to put counters on a permanent, are also made
//     individually.
//   [2023-11-10] If you control two Roaming Thrones with the same chosen creature type, triggered
//     abilities of other creatures you control of the chosen type trigger three times. Three such
//     Roaming Thrones result in four triggered abilities, and so on.
//
// "If a triggered ability of another creature you control of the chosen type
// triggers, it triggers an additional time": `doubleTriggersOf` keyed on whose
// ability it is, its filter reading the type chosen as this entered
// (`ofChosenType`) and leaving the Throne itself out (`others`).

const CHOOSE = "As this creature enters, choose a creature type.";
const TYPE = "This creature is the chosen type in addition to its other types.";
const DOUBLE =
  "If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.";

export default defineCard({
  name: "Roaming Throne",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 4,
  toughness: 4,
  text: `Ward {2}\n${CHOOSE}\n${TYPE}\n${DOUBLE}`,
  chooseCreatureTypeOnEnter: true,
  triggered: [ward({ mana: "{2}" })],
  static: [
    { affects: { scope: "self" }, addsChosenCreatureType: true, text: TYPE },
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { type: "creature", controlledBy: "you", ofChosenType: true }, others: true },
      text: DOUBLE,
    },
  ],
});
