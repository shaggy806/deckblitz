import { defineCard } from "../define.js";

// "You may instead create that many Cats or that many Dogs": asked of you as
// the tokens would be created, and the one taken replaces every token of that
// event, the effect still making them — so they're still tapped and attacking,
// or exiled at end of combat, if the effect says so (the ruling), and are only
// the Cats or Dogs otherwise.
const REPLACE_TEXT =
  "If you would create one or more tokens, you may instead create that many 2/2 green Cat creature tokens with haste or that many 3/1 green Dog creature tokens with vigilance.";

export default defineCard({
  name: "Jinnie Fay, Jetmir's Second",
  manaCost: "{R/G}{G}{G/W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: REPLACE_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        mayTokensInsteadOneOf: [
          { token: "2/2 Green Cat Token (Haste)", text: "Create that many 2/2 green Cats with haste instead" },
          { token: "3/1 Green Dog Token (Vigilance)", text: "Create that many 3/1 green Dogs with vigilance instead" },
        ],
      },
      text: REPLACE_TEXT,
    },
  ],
});
