import { defineCard } from "../define.js";

// EDHREC rank 19826. "When this enters and whenever you cast a spell from
// your graveyard" is two triggers with one effect (Secrets of the Dead's
// `from: "graveyard"`).

const TEXT =
  'When this enchantment enters and whenever you cast a spell from your graveyard, create a 1/1 blue Bird creature token with flying and "This token can block only creatures with flying."';
const BIRD = { kind: "create-token", token: "Bird Token (Ominous Roost)", count: 1 } as const;

export default defineCard({
  name: "Ominous Roost",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: BIRD, resolve: null, text: TEXT },
    { trigger: { on: "cast-spell", who: "you", from: "graveyard" }, targets: [], effect: BIRD, resolve: null, text: TEXT },
  ],
});
