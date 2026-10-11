import { defineCard } from "../define.js";

// EDHREC rank 14670. Faerie Vandal's "second card each turn" trigger (once a
// turn at most, and only if Bard is there for the second draw — the
// rulings) with Rosa, Resolute White Mage's counter-and-lifelink effect.

const TEXT =
  "Whenever you draw your second card each turn, put a +1/+1 counter on target creature. It gains lifelink until end of turn.";

export default defineCard({
  name: "Bard the Bowman",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
