import { defineCard } from "../define.js";

// EDHREC rank 8804.
//
// - "Chooses a party from among creatures they control" (rule 700.8d): for
//   each of Cleric, Rogue, Warrior and Wizard, up to one creature of that
//   type, a creature standing for one type only (700.8b) — the
//   `choose-one-of-each` of `slots: "party"`, each player in turn from the
//   active player, knowing the choices before theirs. "Then sacrifices the
//   rest": every creature not chosen, all at once once everyone has chosen.
const TEXT =
  "Each player chooses a party from among creatures they control, then sacrifices the rest. (To choose a party, choose up to one each of Cleric, Rogue, Warrior, and Wizard.)";

export default defineCard({
  name: "Stick Together",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: "party",
    filter: { type: "creature" },
    rest: "sacrifice",
    prompt: "Choose a party to keep (up to one each of Cleric, Rogue, Warrior and Wizard) — your other creatures are sacrificed",
  },
});
