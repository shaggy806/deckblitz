import { defineCard } from "../define.js";

// EDHREC rank 2580.
//
// Rulings:
//   If the creature dies before the Angelic Destiny spell resolves, Angelic Destiny will go to its
//     owner's graveyard. It won't return to its owner's hand.
//   If Angelic Destiny is no longer in a graveyard when its triggered ability resolves, it won't
//     be returned to its owner's hand.
//
// Draconic Destiny's shape: "this card" is the Aura followed into the graveyard it went to as its
// creature died — its trigger goes on the stack after state-based actions put it there, so a card
// gone from that graveyard (or one exiled instead) stays where it is (rule 400.7). An Aura spell
// whose target is gone never resolves, so it never triggers (the first ruling).

const STATIC_TEXT =
  "Enchanted creature gets +4/+4, has flying and first strike, and is an Angel in addition to its other types.";
const RETURN_TEXT = "When enchanted creature dies, return this card to its owner's hand.";

export default defineCard({
  name: "Angelic Destiny",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["flying", "first-strike"],
      addSubtypes: ["Angel"],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
