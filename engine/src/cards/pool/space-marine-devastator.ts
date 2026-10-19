import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// EDHREC rank 8195.
//
// Squad's tokens are copies of this card (`create-token-copy`), so each copy
// has Grav-cannon and destroys up to one artifact or enchantment of its own.
const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const CANNON_TEXT = "Grav-cannon — When this creature enters, destroy up to one target artifact or enchantment.";

export default defineCard({
  name: "Space Marine Devastator",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 3,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${CANNON_TEXT}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CANNON_TEXT,
    },
  ],
});
