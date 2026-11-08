import { defineCard } from "../define.js";

const UNTAP_TEXT =
  "Whenever a creature you control becomes tapped during your turn, if it's the first time that creature has become tapped this turn, untap it.";

export default defineCard({
  name: "Captain America, Living Legend",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${UNTAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "you-control", filter: { type: "creature" } },
      // The intervening "if" (rule 603.4), asked as it triggers and again as it
      // resolves: that creature, in its stint, has become tapped once this turn
      // by the journal's count, before Captain America arrived too. Tapped
      // again in response, it isn't untapped.
      condition: {
        kind: "all",
        of: [
          { kind: "your-turn" },
          { kind: "trigger-object", filter: { journaled: { what: "tapped", atMost: 1 } } },
        ],
      },
      targets: [],
      effect: { kind: "untap", target: "trigger-object" },
      resolve: null,
      text: UNTAP_TEXT,
    },
  ],
});
