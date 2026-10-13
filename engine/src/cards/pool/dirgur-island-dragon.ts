import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 9466.
// An omen card (rule 720): cast as Skimming Strike it's shuffled into its
// owner's library as it resolves.

const WARD = ward({ mana: "{2}" });

export default defineCard({
  name: "Dirgur Island Dragon",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)",
  triggered: [WARD],
  faces: ["Dirgur Island Dragon", "Skimming Strike"],
  omen: true,
});
