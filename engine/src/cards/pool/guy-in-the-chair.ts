import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const SUPPORT_TEXT =
  "Web Support — {2}{G}, {T}: Put a +1/+1 counter on target Spider. Activate only as a sorcery.";

export default defineCard({
  name: "Guy in the Chair",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text: `{T}: Add one mana of any color.\n${SUPPORT_TEXT}`,
  activated: [
    addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." }),
    {
      cost: { mana: "{2}{G}", tap: true },
      // "Target Spider" — anyone's.
      targets: [{ kind: "permanent", filter: { subtype: "Spider" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SUPPORT_TEXT,
      sorcerySpeed: true,
    },
  ],
});
