import { roomCard } from "../helpers.js";
import left from "./experimental-lab.js";
import right from "./staff-room.js";

// A Room (rule 709.5): each door is cast on its own and enters unlocked; the
// other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Experimental Lab // Staff Room", left, right);
