import { defineCard } from "../define.js";

// EDHREC rank 4680.
//
// Rulings:
//   [2025-06-06] Removing lore counters won't cause a previous chapter ability to trigger. If lore
//     counters are removed from a Saga, the appropriate chapter abilities will trigger again when
//     the Saga receives more lore counters.

const TEXT =
  "Whenever Garnet attacks, you may remove a lore counter from each of any number of Sagas you control. Put a +1/+1 counter on Garnet for each lore counter removed this way.";

export default defineCard({
  name: "Garnet, Princess of Alexandria",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // "Any number" includes none, which is the "may".
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "remove-counters",
            from: { subtype: "Saga" },
            counter: "lore",
            count: "any",
            among: true,
            perObject: 1,
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { thisWay: "counters-removed" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
