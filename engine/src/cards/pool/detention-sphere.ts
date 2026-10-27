import { defineCard } from "../define.js";

// EDHREC rank 8489.
//
// Two linked abilities (rule 607.2a), Worldgorger Dragon's shape: the exile
// is "with this" stint (`linked`), the target's namesakes — lands too, the
// ruling — going untargeted with it (`CardFilter.sameNameAsTarget`). If the
// Sphere leaves before its enters trigger resolves, the return finds nothing
// and the cards stay exiled for good (the ruling).

const ENTER_TEXT =
  "When this enchantment enters, you may exile target nonland permanent not named Detention Sphere and all other permanents with the same name as that permanent.";
const LEAVE_TEXT =
  "When this enchantment leaves the battlefield, return the exiled cards to the battlefield under their owner's control.";

export default defineCard({
  name: "Detention Sphere",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { notTypes: ["land"], notName: "Detention Sphere" } }],
      effect: {
        kind: "may",
        prompt: "Exile the target and every permanent with its name?",
        effect: { kind: "exile-all", filter: { sameNameAsTarget: 0 }, linked: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
