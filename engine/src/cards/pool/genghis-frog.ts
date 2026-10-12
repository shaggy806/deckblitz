import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 15003.
//
// "Genghis Frog or another Mutant you control" is two triggers
// (`thisOrAnother`): its own entry, whatever its types then, and each other
// Mutant entering under your control.
const MUTAGEN =
  "Whenever Genghis Frog or another Mutant you control enters, create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")";

export default defineCard({
  name: "Genghis Frog",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Frog", "Mutant", "Rogue"],
  power: 1,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${MUTAGEN}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Mutant" } },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: MUTAGEN,
    }),
  ],
});
