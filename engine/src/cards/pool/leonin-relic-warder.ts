import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, you may exile target artifact or enchantment.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, return the exiled card to the battlefield under its owner's control.";

// The old two-trigger wording, not "until this leaves" (rule 610.3): the card
// is exiled linked to this creature (rule 607.2a) and the leaves trigger
// returns it. Its ruling: if this creature leaves before the enters trigger
// resolves, the leaves trigger finds nothing, and the card is exiled for good.
export default defineCard({
  name: "Leonin Relic-Warder",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact-or-enchantment"],
      effect: {
        kind: "may",
        prompt: "Exile target artifact or enchantment?",
        effect: { kind: "exile", target: 0, linked: true },
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
