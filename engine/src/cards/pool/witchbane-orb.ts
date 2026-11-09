import { defineCard } from "../define.js";

const ENTERS = "When this artifact enters, destroy all Curses attached to you.";
const HEXPROOF = "You have hexproof. (You can't be the target of spells or abilities your opponents control, including Aura spells.)";

// "Attached to you": an Aura enchanting its controller (rule 303.4,
// `attachedToPlayer`).
export default defineCard({
  name: "Witchbane Orb",
  manaCost: "{4}",
  types: ["artifact"],
  text: `${ENTERS}\n${HEXPROOF}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { subtype: "Curse", attachedToPlayer: "you" } },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "self" }, playerKeywords: ["hexproof"], text: HEXPROOF }],
});
