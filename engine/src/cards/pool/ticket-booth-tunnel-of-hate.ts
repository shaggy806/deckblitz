import { roomCard } from "../helpers.js";
import left from "./ticket-booth.js";
import right from "./tunnel-of-hate.js";

// EDHREC rank 10812. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Ticket Booth // Tunnel of Hate", left, right);
