import { defineCard } from "../define.js";

const QUEST_TEXT =
  "Whenever you cast an instant or sorcery spell that has the same name as a card in your graveyard, you may put a quest counter on this enchantment.";
const COPY_TEXT =
  "Whenever you cast an instant or sorcery spell while this enchantment has two or more quest counters on it, you may copy that spell. You may choose new targets for the copy.";

// The name is asked as the spell is cast, of the cards then in your graveyard
// (`sameNameWith: { graveyard }`, rule 201.2a). "While" is part of the trigger
// condition (rule 603.1), not an intervening "if": the first ability's counter
// comes too late for the same cast, and losing counters in response doesn't
// stop the copy.
export default defineCard({
  name: "Pyromancer Ascension",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${QUEST_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], sameNameWith: { graveyard: { ownedBy: "you" } } },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Pyromancer Ascension?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: QUEST_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      whileCondition: { kind: "source", filter: { counters: { kind: "quest", compare: { op: "gte", n: 2 } } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
