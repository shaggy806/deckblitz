import { defineCard } from "../define.js";
import { hideaway, playHideawayCard } from "../helpers.js";

const CAGE_TEXT =
  "{1}, {T}: Put a +1/+1 counter on target creature you control. Then if you control three or more creatures with different powers, you may play the exiled card without paying its mana cost.";

export default defineCard({
  name: "Collector's Cage",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  text:
    "Hideaway 5 (When this artifact enters, look at the top five cards of your library, exile one face down, then put the rest on the bottom in a random order.)\n" +
    CAGE_TEXT,
  triggered: [hideaway(5, "artifact")],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            // Coven, read as the ability resolves — after the counter (the ruling).
            kind: "conditional",
            condition: { kind: "coven" },
            then: playHideawayCard(),
          },
        ],
      },
      resolve: null,
      text: CAGE_TEXT,
    },
  ],
});
