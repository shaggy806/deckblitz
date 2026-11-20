import { defineCard } from "../define.js";

// Top-1000 commander #737. Impossible Girl is `chooseColorAsCommander`: the
// colour is chosen as the deck is built (rule 903.4b — `DeckList.
// commanderColors`), revealed as Clara goes into the command zone, part of
// the deck's colour identity, and her colour in every zone all game. In the
// 99 she makes no choice and stays colourless.
const IMPOSSIBLE_GIRL =
  "Impossible Girl — If Clara Oswald is your commander, choose a color before the game begins. Clara Oswald is the chosen color.";
const DOUBLE_TEXT = "If a triggered ability of a Doctor you control triggers, that ability triggers an additional time.";
const COMPANION = "Doctor's companion (You can have two commanders if the other is the Doctor.)";

export default defineCard({
  name: "Clara Oswald",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 6,
  chooseColorAsCommander: true,
  pairing: { kind: "doctors-companion" },
  text: `${IMPOSSIBLE_GIRL}\n${DOUBLE_TEXT}\n${COMPANION}`,
  static: [
    {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { subtype: "Doctor", controlledBy: "you" } },
      text: DOUBLE_TEXT,
    },
  ],
});
