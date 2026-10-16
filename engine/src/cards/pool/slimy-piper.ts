import { defineCard } from "../define.js";

// EDHREC rank 20090. The "instead" is a `conditional` read as the trigger
// resolves, counting this creature among the four.

const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +1/+1 until end of turn. If you control four or more creatures, it gets +2/+2 and gains indestructible until end of turn instead.";

export default defineCard({
  name: "Slimy Piper",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Bard"],
  power: 2,
  toughness: 1,
  text: `${ATTACK_TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature" }, atLeast: 4 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
            { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
        else: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
