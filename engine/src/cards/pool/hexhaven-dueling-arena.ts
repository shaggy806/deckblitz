import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Either target may be a creature without a prepare spell: legal, and then
// nothing happens (rule 722.3a — "a creature without a prepare spell can't
// become prepared").
const ATTACKED_TEXT =
  "{2}, {T}: Target creature that attacked this turn becomes prepared. Activate only as a sorcery. " +
  "(Only creatures with prepare spells can become prepared.)";
const ANY_TEXT = "{4}, {T}: Target creature becomes prepared.";

export default defineCard({
  name: "Hexhaven Dueling Arena",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ATTACKED_TEXT}\n${ANY_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attackedThisTurn: true } }],
      effect: { kind: "become-prepared", target: 0 },
      resolve: null,
      sorcerySpeed: true,
      text: ATTACKED_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-prepared", target: 0 },
      resolve: null,
      text: ANY_TEXT,
    },
  ],
});
