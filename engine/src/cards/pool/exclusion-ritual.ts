import { defineCard } from "../define.js";

const ENTERS_TEXT = "Imprint — When this enchantment enters, exile target nonland permanent.";
const LOCK_TEXT = "Players can't cast spells with the same name as the exiled card.";

// Ixalan's Binding's lock for every player, over a card exiled for good.
export default defineCard({
  name: "Exclusion Ritual",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${LOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { sameNameWith: "exiled-with-source" } }],
      text: LOCK_TEXT,
    },
  ],
});
