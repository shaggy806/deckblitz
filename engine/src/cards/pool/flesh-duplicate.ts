import { defineCard } from "../define.js";
import { vanishing } from "../helpers.js";

const TEXT =
  "You may have this creature enter as a copy of any creature on the battlefield, except it has vanishing 3 if that creature doesn't have vanishing. (A permanent with vanishing 3 enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)";

const V = vanishing(3);

export default defineCard({
  name: "Flesh Duplicate",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Rebel"],
  power: 0,
  toughness: 0,
  text: TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    except: { ifCopied: [{ lacksKeyword: "vanishing", patch: { static: V.static, triggered: V.triggered } }] },
  },
});
