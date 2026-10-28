import { defineCard } from "../define.js";

// EDHREC rank 3864. "If it wasn't cast" can't change between the trigger and
// its resolution, so it's the trigger's filter. The copy's exceptions are
// copiable values (rule 707.9b): 0/1, white, and an Illusion instead of its
// other creature types.

export default defineCard({
  name: "Preston, the Vanisher",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rabbit", "Wizard"],
  power: 2,
  toughness: 5,
  text: "Whenever another nontoken creature you control enters, if it wasn't cast, create a token that's a copy of that creature, except it's a 0/1 white Illusion.\n{1}{W}, Sacrifice five Illusions: Exile target nonland permanent.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, type: "creature", cast: false },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "trigger-object",
        count: 1,
        exceptions: { basePt: [0, 1], setColors: ["W"], setSubtypes: ["Illusion"] },
      },
      resolve: null,
      text: "Whenever another nontoken creature you control enters, if it wasn't cast, create a token that's a copy of that creature, except it's a 0/1 white Illusion.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: { filter: { subtype: "Illusion" }, count: 5 } },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}{W}, Sacrifice five Illusions: Exile target nonland permanent.",
    },
  ],
});
