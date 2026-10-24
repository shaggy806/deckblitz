import { defineCard } from "../define.js";

// EDHREC rank 19889.
//
// Wall of Resurgence's "you may … if you do, that land becomes" shape, off a
// cast trigger; not awaken (the ruling), so it's no `awaken` here.
const TEXT =
  "Whenever you cast an instant or sorcery spell, you may put three +1/+1 counters on target land you control. If you do, that land becomes a 0/0 Elemental creature with haste that's still a land.";

export default defineCard({
  name: "Noyan Dar, Roil Shaper",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Ally"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt: "Put three +1/+1 counters on that land and make it a 0/0 Elemental creature with haste?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
            {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              keywords: ["haste"],
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
