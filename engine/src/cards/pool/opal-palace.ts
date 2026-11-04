import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 684. "Your commander" is a commander you own (rule 903.3). No
// trigger: this mana adds to how the spell enters (rules 106.6, 614.1c), each
// unit spent its own counters (the Mana Reflection ruling), and the count
// includes the cast that spent it (the ruling), read as it enters.

const IDENTITY_TEXT =
  "{1}, {T}: Add one mana of any color in your commander's color identity. If you spend this mana to cast your " +
  "commander, it enters with a number of additional +1/+1 counters on it equal to the number of times it's been " +
  "cast from the command zone this game.";

export default defineCard({
  name: "Opal Palace",
  types: ["land"],
  text: `{T}: Add {C}.\n${IDENTITY_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "commander-identity",
        amount: 1,
        spellEntersWith: {
          spell: { isCommander: true, ownedBy: "you" },
          counter: "+1/+1",
          amount: { commanderCastsOf: "source" },
        },
      },
      resolve: null,
      text: IDENTITY_TEXT,
    },
  ],
});
