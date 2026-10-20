import { defineCard } from "../define.js";

// "Doesn't untap" alone — the creature isn't tapped (`onlyDoesntUntap`): one
// already tapped stays tapped through its controller's next untap step.
const REDUCTION_TEXT = "Blue creature spells you cast cost {1} less to cast.";
const TRIGGER_TEXT =
  "Whenever you cast a creature spell, target creature an opponent controls doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Kefnet's Monument",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${REDUCTION_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature", colors: ["U"] }, caster: "you", reduceGeneric: 1 },
      text: REDUCTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
