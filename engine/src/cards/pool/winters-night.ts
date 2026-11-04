import { defineCard } from "../define.js";

// A triggered mana ability (rule 605.1b): "that land doesn't untap" is part of
// it, off the stack (rule 605.4a).

const TEXT =
  "Whenever a player taps a snow land for mana, that player adds one mana of any type that land produced. That land doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Winter's Night",
  manaCost: "{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land", supertype: "snow" } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "produced",
        amount: 1,
        also: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
