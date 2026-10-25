import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

const ETB_TEXT =
  "When this creature enters, artifacts and creatures target opponent controls don't untap during that player's next untap step.";
const BOUNCE_TEXT = "Return three snow lands you control to their owner's hand: Return this creature to its owner's hand.";

export default defineCard({
  name: "Icebreaker Kraken",
  manaCost: "{10}{U}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 8,
  toughness: 8,
  text: `Affinity for snow lands (This spell costs {1} less to cast for each snow land you control.)\n${ETB_TEXT}\n${BOUNCE_TEXT}`,
  selfCostReduction: affinity({ type: "land", supertype: "snow" }),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // Read at that player's untap step, so an artifact or creature they
      // gain control of after this resolves is held too (the ruling).
      effect: { kind: "skip-next-untap", filter: { typesAnyOf: ["artifact", "creature"] }, who: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, returnToHand: { count: 3, filter: { type: "land", supertype: "snow" } } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE_TEXT,
    },
  ],
});
