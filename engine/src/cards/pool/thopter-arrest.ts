import { defineCard } from "../define.js";

// Detention Chariot's O-Ring trigger: if this leaves before the trigger
// resolves, nothing is exiled; a token exiled this way doesn't come back.
const ENTERS =
  "When this enchantment enters, exile target artifact or creature an opponent controls until this enchantment leaves the battlefield.";

export default defineCard({
  name: "Thopter Arrest",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTERS,
    },
  ],
});
