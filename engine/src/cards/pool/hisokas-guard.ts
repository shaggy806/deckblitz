import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 27897. Ashnod's Battle Gear's
// "for as long as this remains tapped", on a keyword.

const ACTIVATED_TEXT =
  "{1}{U}, {T}: Target creature you control other than this creature has shroud for as long as this creature remains tapped.";

export default defineCard({
  name: "Hisoka's Guard",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `You may choose not to untap this creature during your untap step.\n${ACTIVATED_TEXT} (It can't be the target of spells or abilities.)`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "while-source-tapped" },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayChooseNotToUntap: true,
      text: "You may choose not to untap this creature during your untap step.",
    },
  ],
});
