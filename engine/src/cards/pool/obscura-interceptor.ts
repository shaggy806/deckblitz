import { defineCard } from "../define.js";

// EDHREC rank 19422. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If a resolving spell or ability instructs a specific creature to connive but that
//     creature has left the battlefield, the creature still connives. Abilities that trigger “when
//     [that creature] connives,” such as that of Obscura Interceptor, will trigger.
//
// The connive always happens (it left or not), so the reflexive "when it
// connives this way" ability always triggers once the connive is done; its
// target is chosen then, as it goes on the stack (rule 603.12).
const RETURN_TEXT = "When it connives this way, return up to one target spell to its owner's hand.";
const TEXT = `When this creature enters, it connives. ${RETURN_TEXT}`;

export default defineCard({
  name: "Obscura Interceptor",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "lifelink"],
  text: `Flash\nLifelink\n${TEXT} (To have a creature connive, draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "connive", target: "source" },
          {
            kind: "reflexive-trigger",
            targets: [{ kind: "optional", of: "spell" }],
            effect: { kind: "return-to-hand", target: 0, from: "stack" },
            text: RETURN_TEXT,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
