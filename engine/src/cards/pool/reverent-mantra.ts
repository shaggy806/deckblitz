import { defineCard } from "../define.js";

// EDHREC rank 13583.
export default defineCard({
  name: "Reverent Mantra",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["W"] }, text: "a white card" } },
  text: "You may exile a white card from your hand rather than pay this spell's mana cost.\nChoose a color. All creatures gain protection from the chosen color until end of turn.",
  targets: [],
  effect: {
    kind: "grant-protection",
    filter: { type: "creature" },
    from: { choose: "color" },
    duration: "end-of-turn",
  },
});
