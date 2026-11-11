import { defineCard } from "../define.js";

const COPY_TEXT =
  "{1}, {T}: Copy target activated or triggered ability you control from another legendary source that's not a " +
  "commander. You may choose new targets for the copy. (Mana abilities can't be targeted.)";

// A "legendary source" is a permanent, spell or card in any zone with the
// supertype (the ruling: a legendary card's cycling ability counts), read as
// it is, or as it last existed on the battlefield once it has left (rule
// 113.7a). "Another": not the Dynamo's own abilities. The copy has the
// original's source (rule 707.10b).
export default defineCard({
  name: "The Peregrine Dynamo",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "ability",
          whose: "you",
          otherSource: true,
          sourceFilter: { supertype: "legendary", isCommander: false },
        },
      ],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
