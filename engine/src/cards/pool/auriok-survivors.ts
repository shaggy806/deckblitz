import { defineCard } from "../define.js";

// EDHREC rank 27664. "You may return … If you do, you may attach it": both
// choices are asked before the move (nothing is learned in between), and
// "attach" puts it onto the battlefield attached to Auriok Survivors — an
// Equipment that can't equip it, or with Survivors gone, enters unattached
// (the ruling).
const TEXT =
  "When this creature enters, you may return target Equipment card from your graveyard to the battlefield. If you do, you may attach it to this creature.";

export default defineCard({
  name: "Auriok Survivors",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Equipment" } }],
      effect: {
        kind: "may",
        prompt: "Return target Equipment card from your graveyard to the battlefield?",
        effect: {
          kind: "may",
          prompt: "Attach it to Auriok Survivors?",
          effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "source" },
          else: { kind: "put-onto-battlefield", target: 0 },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
