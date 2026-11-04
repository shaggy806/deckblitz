import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

const ANY_TEXT =
  "{1}, {T}: Add one mana of any color. If that mana is spent on a multicolored creature spell, that creature enters " +
  "with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Guildmages' Forum",
  types: ["land"],
  text: `{T}: Add {C}.\n${ANY_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spellEntersWith: { spell: { type: "creature", multicolored: true }, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ANY_TEXT,
    },
  ],
});
