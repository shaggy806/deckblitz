import { defineCard } from "../define.js";

// EDHREC rank 29250.

const ENTER_TEXT = "When this creature enters, choose one —";
const RETURN_MODE = "• Return target legendary card from your graveyard to your hand.";
const COUNTER_MODE =
  "• Put a +1/+1 counter on target creature. It gains vigilance and indestructible until end of turn.";

// The mode is chosen as the trigger goes on the stack (rule 700.2b —
// `announced`). "Legendary card" is any card type.
export default defineCard({
  name: "Fateshaper Aspirant",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Cleric"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${RETURN_MODE}\n${COUNTER_MODE} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: RETURN_MODE,
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { supertype: "legendary" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: COUNTER_MODE,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: `${ENTER_TEXT} ${RETURN_MODE} ${COUNTER_MODE}`,
    },
  ],
});
