import { defineCard } from "../define.js";

// EDHREC rank 25863.
//
// Rulings:
//   You don't choose a target for General Traag's last ability at the time it triggers. Rather, a
//     second "reflexive" ability triggers when you sacrifice another artifact this way. You choose
//     a target for that ability as it goes on the stack. Each player may respond to this
//     triggered ability as normal.
//
// Cavalier of Night's shape: the optional sacrifice as the trigger resolves,
// then a reflexive trigger (rule 603.12) that picks its target.

const ENTER_TEXT =
  "When General Traag enters, you may sacrifice another artifact. When you do, General Traag deals 4 damage to target creature.";

export default defineCard({
  name: "General Traag, Heart of Stone",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Elemental", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, exceptSource: true, text: "Sacrifice another artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "damage", amount: 4, target: 0 },
          text: "When you do, General Traag deals 4 damage to target creature.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
