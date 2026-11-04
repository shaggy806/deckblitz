import { defineCard } from "../define.js";

const ENTER_TEXT =
  "As this creature enters, exile X creature cards from your graveyard. If you can't, put this creature into its owner's graveyard instead of onto the battlefield. For each creature card exiled this way, this creature enters with a +2/+0, +1/+1, or +0/+2 counter on it.";

export default defineCard({
  name: "Frankenstein's Monster",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 1,
  text: ENTER_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: {
          exile: {
            filter: { type: "creature" },
            count: "x",
            orToGraveyard: true,
            counterForEach: ["+2/+0", "+1/+1", "+0/+2"],
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
