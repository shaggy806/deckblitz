/**
 * Jace, Architect of Thought: a pile put on the bottom of a library in any
 * order (`PileFate` `"library-bottom"`, rule 401.4), and every library
 * searched as one search whose choices are made together (`search-library`'s
 * `eachLibrary`, the card's ruling), up to one find from each, then each
 * player shuffles and the finds may be cast free.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";

import { A, B, C, D, attack, hand, loyalty, pt, spawn, table, toLibrary, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** The seat casts `want` in turn, by name, then declines. */
function casting(seat: ScriptedController, want: readonly string[]): Offer[] {
  const offers: Offer[] = [];
  const left = [...want];
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    offers.push(offer);
    const name = left.shift();
    if (name === undefined) return null;
    const way = offer.casts.find((c) => c.cardName === name);
    if (way === undefined) throw new Error(`${name} isn't on offer: ${offer.casts.map((c) => c.cardName).join(", ")}`);
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
  };
  return offers;
}

describe("Jace, Architect of Thought", () => {
  it("+1: an opponent's attacking creature gets -1/-0, until your next turn", () => {
    const { game, b } = table();
    const jace = spawn(game, "Jace, Architect of Thought");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, jace, 1);
    attack(game, b, [bears], A);
    expect(pt(game, bears).power).toBe(1);
  });

  it("−2: the opponent separates, you choose; the other pile goes to the bottom in the order you pick", () => {
    const { game, a, b } = table();
    const jace = spawn(game, "Jace, Architect of Thought");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    // Top to bottom: Giant, Bears, Bolt.
    b.separatePilesFn = () => [[giant], [bears, bolt]];
    a.choosePileFn = () => 0;
    let ordered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      ordered = eligible;
      return [bolt, bears];
    };
    loyalty(game, jace, -2);
    expect(hand(game)).toContain(giant);
    expect([...ordered].sort()).toEqual([bears, bolt].sort());
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2).sort()).toEqual([bears, bolt].sort());
    expect(library.indexOf(bears)).toBeGreaterThan(library.length - 3);
  });

  it("−2: an empty pile — both cards to the bottom when that's the pile left", () => {
    const { game, a, b } = table();
    const jace = spawn(game, "Jace, Architect of Thought");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    b.separatePilesFn = () => [[], [giant, bears, bolt]];
    a.choosePileFn = () => 0;
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    loyalty(game, jace, -2);
    expect(hand(game)).not.toContain(giant);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([giant, bears, bolt].sort());
  });

  it("−8: every library in one search, one nonland card from each, then each shuffles and you cast them free", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace, Architect of Thought");
    const divination = toLibrary(game, "Divination");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant", B);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [divination, giant];
    };
    const offers = casting(a, ["Hill Giant", "Divination"]);
    const handBefore = hand(game).length;
    loyalty(game, jace, -8, { atLeast: 8 });
    // Both libraries' nonland cards in the one choice; no Wastes.
    expect([...offered].sort()).toEqual([divination, bears, giant].sort());
    expect(offers.length).toBeGreaterThanOrEqual(2);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore + 2);
    expect(zone(game, bears)).toBe("library");
  });

  it("−8: one from each library at most — a choice of two from one is refused", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, Architect of Thought");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant", B);
    game.state.objects[jace].counters.loyalty = 8;
    const index = game.registry.get("Jace, Architect of Thought").activated.findIndex((ab) => ab.loyaltyCost === -8);
    game.dispatch({ type: "activate-ability", player: A, source: jace, abilityIndex: index, targets: [] });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bears, giant] })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [giant] })).toBeNull();
  });

  it("−8 at four players: each library searched, each shuffled", () => {
    const { game, a } = table({ players: 4 });
    const jace = spawn(game, "Jace, Architect of Thought");
    const finds = [toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Hill Giant", C), toLibrary(game, "Gray Ogre", D)];
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    casting(a, []);
    loyalty(game, jace, -8, { atLeast: 8 });
    for (const id of finds) expect(zone(game, id)).toBe("exile");
    const shuffled = game.state.eventLog.filter((e) => e.type === "library-shuffled").map((e) => (e as { player: string }).player);
    expect([...new Set(shuffled)].sort()).toEqual([A, B, C, D].sort());
  });
});
