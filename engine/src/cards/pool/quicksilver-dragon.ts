import { defineCard } from "../define.js";

// EDHREC rank 24038.
//
// Meddle's shape, the target this creature (`isSource`): any spell can be
// targeted; as the ability resolves it works only on a spell whose one target
// is this creature, whose new target must be another creature legal for it
// (`newTargetIs`, rule 115.7a). With none, the target stays.

const TEXT =
  "{U}: If target spell has only one target and that target is this creature, change that spell's target to another creature.";

export default defineCard({
  name: "Quicksilver Dragon",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{4}{U}" },
  text: `Flying\n${TEXT}\nMorph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["spell"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { targets: { count: 1, permanent: { isSource: true } } } },
        then: { kind: "change-targets", target: 0, how: "change", newTargetIs: { type: "creature" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
