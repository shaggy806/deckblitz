import { defineCard } from "../define.js";

const WHEN_YOU_DO = "When you do, exile that card.";
const TEXT =
  "Mind Swap — You may have Superior Spider-Man enter as a copy of any creature card in a graveyard, except his name " +
  `is Superior Spider-Man and he's a 4/4 Spider Human Hero in addition to his other types. ${WHEN_YOU_DO}`;

// The exile is a triggered ability linked to the copy (rule 603.11): he's on
// the battlefield by then, and players can respond to it. He's legendary only
// if the card he copied is: nothing in the exceptions says so.
export default defineCard({
  name: "Superior Spider-Man",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 4,
  text: TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    from: "graveyards",
    except: { name: "Superior Spider-Man", basePt: [4, 4], addSubtypes: ["Spider", "Human", "Hero"] },
    whenYouDo: { effect: { kind: "exile", target: "trigger-object" }, text: WHEN_YOU_DO },
  },
});
