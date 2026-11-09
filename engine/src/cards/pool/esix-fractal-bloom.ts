import { defineCard } from "../define.js";

const TEXT =
  "The first time you would create one or more tokens during each of your turns, you may instead choose a creature other than Esix and create that many tokens that are copies of that creature.";

// EDHREC rank 5891. Any token (a ruling): the `becomes` replaces the whole
// event. "During each of your turns" is the static's condition; "first" reads
// the journal, so a token made before Esix arrived counts (the ruling).
export default defineCard({
  name: "Esix, Fractal Bloom",
  manaCost: "{4}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fractal"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      // Nothing to choose, no replacing: only with a creature other than Esix.
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "controls", filter: { type: "creature" }, atLeast: 1, anyController: true }] },
      replacement: {
        event: "would-create-token",
        firstEachTurn: true,
        may: true,
        becomes: {
          effect: {
            kind: "choose-permanents",
            filter: { type: "creature" },
            min: 1,
            upTo: 1,
            exceptSource: true,
            prompt: "Choose a creature other than Esix",
            then: { kind: "create-token-copy", of: 0, count: "x", who: "you" },
          },
          text: "Choose a creature other than Esix and create that many tokens that are copies of it",
        },
      },
      text: TEXT,
    },
  ],
});
