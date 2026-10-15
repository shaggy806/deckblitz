import { defineCard } from "../define.js";
import { powerUp } from "../helpers.js";

// EDHREC rank 23166. Power-up (rule 702.193a) through the `powerUp` helper;
// The Tiger God is a named legendary token keyed by its own name.
const POWER_UP_TEXT =
  "Power-up — {5}{G}: Put a +1/+1 counter on White Tiger and create The Tiger God, a legendary 4/4 green Cat God creature token with \"The Tiger God can't be blocked by more than one creature.\" (Activate each power-up ability only once. Reduce the cost by her mana cost if she entered this turn.)";

export default defineCard({
  name: "White Tiger, Ava Ayala",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  text: POWER_UP_TEXT,
  activated: [
    powerUp(
      "{5}{G}",
      {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "create-token", token: "The Tiger God", count: 1 },
        ],
      },
      POWER_UP_TEXT,
    ),
  ],
});
