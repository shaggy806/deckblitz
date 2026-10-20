import { defineCard } from "../define.js";

// EDHREC rank 13263. The ability needs a target to be activated (the
// ruling), so Rootha can't be bounced for nothing.
const TEXT =
  "{2}, Return Rootha to its owner's hand: Copy target instant or sorcery spell you control. You may choose new targets for the copy.";

export default defineCard({
  name: "Rootha, Mercurial Artist",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman"],
  power: 1,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnSelfToHand: true },
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
