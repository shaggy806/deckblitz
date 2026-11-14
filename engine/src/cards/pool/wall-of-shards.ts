import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 8785.

// "An opponent gains 1 life" once per age counter, an opponent chosen for
// each (rule 702.24a): the chooser picks among their opponents as each pass
// resolves; with one opponent nobody is asked.
const upkeep = cumulativeUpkeep({
  doing: { kind: "choose-opponent", then: { kind: "gain-life", amount: 1, who: "that-player" } },
  text: "An opponent gains 1 life",
});

export default defineCard({
  name: "Wall of Shards",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 8,
  keywords: ["defender", "flying"],
  text: `Defender, flying\n${upkeep.text}`,
  triggered: [upkeep],
});
