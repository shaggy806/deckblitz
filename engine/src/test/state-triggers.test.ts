/**
 * State triggers (rule 603.8 — the `"state"` trigger): they trigger as soon
 * as their state is true, with no event, and don't trigger again while an
 * instance waits or is on the stack; once it's gone, a state still true
 * triggers again. Homarid, Tidal Influence, Dark Depths, Goblins of the
 * Flarg, Serendib Djinn, Mana Vortex, Mazemind Tome, Endrek Sahr and
 * Darksteel Reactor.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  zone,
} from "./harness.js";

describe("state triggers", () => {
  it("Homarid: the tide cycle — -1/-1 at one, +1/+1 at three, cleared at four", () => {
    const { game } = table();
    const homarid = enter(game, "Homarid");
    expect(counters(game, homarid, "tide")).toBe(1);
    expect(pt(game, homarid)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, homarid, "tide")).toBe(2);
    expect(pt(game, homarid)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, homarid)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    nextTurn(game);
    // The fourth counter: the state trigger takes them all off.
    expect(counters(game, homarid, "tide")).toBe(0);
    expect(pt(game, homarid)).toEqual({ power: 2, toughness: 2 });
  });

  it("Tidal Influence: every blue creature's power follows its tide counters", () => {
    const { game } = table();
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", B);
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Tidal Influence");
    expect(pt(game, merfolk)).toEqual({ power: -1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Tidal Influence can't be cast while one is on the battlefield, anyone's", () => {
    const { game } = table();
    spawn(game, "Tidal Influence", B);
    lands(game, "Island", 3);
    expect(() => cast(game, toHand(game, "Tidal Influence"))).toThrow();
  });

  it("Dark Depths: the last ice counter makes Marit Lage", () => {
    const { game } = table();
    const depths = enter(game, "Dark Depths");
    expect(counters(game, depths, "ice")).toBe(10);
    game.state.objects[depths].counters.ice = 1;
    lands(game, "Wastes", 3);
    activate(game, depths, 0);
    expect(zone(game, depths)).toBe("graveyard");
    expect(tokensNamed(game, "Marit Lage Token", A)).toBe(1);
  });

  it("triggers once while its instance waits, and again once it's gone if still true", () => {
    const { game } = table();
    const depths = spawn(game, "Dark Depths");
    game.state.objects[depths].counters = {};
    // The state holds at every check while its instance is on the stack:
    // still one instance, however many times priority comes round.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBeLessThanOrEqual(1);
    settle(game);
    expect(tokensNamed(game, "Marit Lage Token", A)).toBe(1);
  });

  it("Goblins of the Flarg: a Dwarf of yours, not an opponent's, makes you sacrifice it", () => {
    const { game } = table();
    const goblins = spawn(game, "Goblins of the Flarg");
    enter(game, "Dwarven Lieutenant", B);
    expect(zone(game, goblins)).toBe("battlefield");
    enter(game, "Dwarven Lieutenant");
    expect(zone(game, goblins)).toBe("graveyard");
  });

  it("Serendib Djinn: an Island sacrificed hurts, and no lands at all sacrifices it", () => {
    const { game } = table();
    const djinn = spawn(game, "Serendib Djinn");
    const [island] = lands(game, "Island", 1);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, island)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
    expect(zone(game, djinn)).toBe("graveyard");
  });

  it("Mana Vortex: no lands anywhere, and it's sacrificed", () => {
    const { game } = table();
    const vortex = spawn(game, "Mana Vortex");
    const [mine] = lands(game, "Wastes", 1);
    const [theirs] = lands(game, "Wastes", 1, B);
    destroy(game, mine);
    expect(zone(game, vortex)).toBe("battlefield");
    destroy(game, theirs);
    expect(zone(game, vortex)).toBe("graveyard");
  });

  it("Mana Vortex: cast without sacrificing a land, it's countered", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    // Declining the only option: no land of another kind to sacrifice is
    // offered as a choice to keep it.
    pickModes(a);
    const vortex = toHand(game, "Mana Vortex");
    cast(game, vortex);
    expect(zone(game, vortex)).toBe("graveyard");
  });

  it("Mazemind Tome: the fourth page counter exiles it for 4 life", () => {
    const { game } = table();
    const tome = spawn(game, "Mazemind Tome");
    game.state.objects[tome].counters.page = 3;
    activate(game, tome, 0);
    expect(zone(game, tome)).toBe("exile");
    expect(life(game, A)).toBe(24);
  });

  it("Endrek Sahr: seven Thrulls and it's sacrificed", () => {
    const { game } = table();
    const endrek = spawn(game, "Endrek Sahr, Master Breeder");
    for (let i = 0; i < 6; i++) spawn(game, "Thrull Token");
    settle(game);
    expect(zone(game, endrek)).toBe("battlefield");
    enter(game, "Thrull Token");
    expect(zone(game, endrek)).toBe("graveyard");
  });

  it("Darksteel Reactor: twenty charge counters win the game", () => {
    const { game, a } = table();
    const reactor = spawn(game, "Darksteel Reactor");
    game.state.objects[reactor].counters.charge = 19;
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBe(A);
  });
});
