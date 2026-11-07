import { defineCard } from "../define.js";

// EDHREC rank 4121.
//
// Mirrorworks' trigger, then "if the token isn't a creature, it becomes a 2/2
// Robot Villain creature in addition to its other types": not a copy
// exception (no "except"), so not part of the token's copiable values — an
// effect of the resolving ability with no duration, applied to the token made
// this way if it isn't a creature as this resolves (layer 4 for the types,
// 7b for the 2/2). A copy of a creature is left as it is.
const TEXT =
  "Whenever another nontoken artifact you control enters, you may pay {2}. If you do, create a token that's a copy of it. If the token isn't a creature, it becomes a 2/2 Robot Villain creature in addition to its other types.";

export default defineCard({
  name: "Ultron, Artificial Malevolence",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "artifact" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a token that's a copy of that artifact?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token-copy", of: "trigger-object", count: 1, who: "you" },
            {
              kind: "animate-all",
              filter: { thisWay: "created", notTypes: ["creature"] },
              power: 2,
              toughness: 2,
              addTypes: ["creature"],
              addSubtypes: ["Robot", "Villain"],
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
