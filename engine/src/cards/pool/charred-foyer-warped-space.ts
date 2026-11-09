import { roomCard } from "../helpers.js";
import left from "./charred-foyer.js";
import right from "./warped-space.js";

// EDHREC rank 2862. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Charred Foyer // Warped Space", left, right);
