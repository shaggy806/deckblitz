import { defineCard } from "../define.js";

// Banned in Commander, in the pool for casual decks. Also Yavimaya
// Bloomsage's prepare spell (rule 722). A mana ability the caster has for the
// turn, not a permanent's (`PlayerManaAbility`): offered on their own with
// priority, and reached for by every payment after their permanents.
const TEXT = "Until end of turn, any time you could activate a mana ability, you may pay 1 life. If you do, add {C}.";

export default defineCard({
  name: "Channel",
  // Pinned: Scryfall answers "Channel" by name with Yavimaya Bloomsage //
  // Channel, whose prepare spell shares the name.
  art: "ce54c7c1-3401-4414-8da0-5846cb0ae1b4",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "player-effect",
    duration: "end-of-turn",
    manaAbility: { payLife: 1, add: ["C"], text: "Pay 1 life: Add {C}." },
  },
});
