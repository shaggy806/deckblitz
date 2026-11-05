import { defineCard } from "../define.js";

// EDHREC rank 10996.
//
// Rulings:
//   [2009-02-01] If the attacking creature has left the battlefield by the time Sovereigns of
//     Lost Alara's second ability resolves, you can't put an Aura onto the battlefield this way.
//     You may still choose to search your library just to shuffle it.
//   [2009-02-01] Any Aura card you find with Sovereigns of Lost Alara's second ability must be able
//     to enchant the attacking creature as it currently exists.
//   [2009-02-01] The attacking creature is not targeted by either this ability or the Aura, so a
//     creature with shroud can be enchanted this way.
//
// Exalted is the attacks-alone pump (Ethercaste Knight). The found Aura enters
// attached to the attacking creature (`attachedTo: "trigger-object"`); one
// that can't legally enchant it stays in the library (rule 303.4i).
const EXALTED_TEXT =
  "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)";
const SEARCH_TEXT =
  "Whenever a creature you control attacks alone, you may search your library for an Aura card that could enchant that creature, put it onto the battlefield attached to that creature, then shuffle.";

export default defineCard({
  name: "Sovereigns of Lost Alara",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 5,
  text: `${EXALTED_TEXT}\n${SEARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: EXALTED_TEXT,
    },
    {
      trigger: { on: "attacks-alone", who: "you-control" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Aura card that could enchant the attacking creature?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Aura" },
          destination: "battlefield",
          min: 0,
          max: 1,
          attachedTo: "trigger-object",
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
