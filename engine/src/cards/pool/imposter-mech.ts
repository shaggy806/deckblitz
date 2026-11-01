import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const COPY_TEXT =
  "You may have this Vehicle enter as a copy of a creature an opponent controls, except it's a Vehicle artifact with " +
  "crew 3 and it loses all other card types.";

// It loses the copied creature's subtypes with its card type (its ruling), and
// doesn't get them back when crewed.
export default defineCard({
  name: "Imposter Mech",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 1,
  text: `${COPY_TEXT}\n${crewText(3)}`,
  copyOnEnter: {
    filter: { type: "creature", controlledBy: "opponent" },
    except: { setTypes: ["artifact"], setSubtypes: ["Vehicle"], activated: [crew(3)] },
  },
  activated: [crew(3)],
});
