import { roomCard } from "../helpers.js";
import left from "./dazzling-theater.js";
import right from "./prop-room.js";

// A Room (rule 709.5): each door is cast on its own and enters unlocked; the
// other is unlocked by paying its mana cost as a sorcery.
export default roomCard("Dazzling Theater // Prop Room", left, right);
