/**
 * The `swap-blocks` effect: two blockers trade what they block (Sorrow's
 * Path — removed from combat, then blocking by an effect, rules 506.4,
 * 509.3a-d) or two blocked attackers trade their blockers (General Jarkeld —
 * nothing triggers, its rulings), each only if it could take the other's
 * part.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, life, ref, spawn, table } from "./harness.js";

const toBlocks = (game: Game, holder: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === holder && s.awaiting === null);

/** Alice attacks Bob with `attackers`; Bob blocks as `blocks` pairs them. */
const combat = (attackerNames: readonly string[], blockerNames: readonly string[], source: string) => {
  const t = table();
  const { game, a, b } = t;
  const attackers = attackerNames.map((name) => spawn(game, name, A));
  const blockers = blockerNames.map((name) => spawn(game, name, B));
  const path = spawn(game, source, A);
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  b.declareBlockersFn = () => blockers.map((blocker, i) => ({ blocker, attacker: attackers[i] }));
  toBlocks(game, A);
  return { ...t, attackers, blockers, path };
};

const blocking = (game: Game, id: ObjectId) => game.state.objects[id].blocking;
const blockedBy = (game: Game, id: ObjectId) => game.state.objects[id].blockedBy;

describe("Sorrow's Path", () => {
  it("swaps two blockers, each blocking what the other was, the land hurting its controller", () => {
    const { game, attackers, blockers, path } = combat(["Hill Giant", "Craw Wurm"], ["Llanowar Elves", "Grizzly Bears"], "Sorrow's Path");
    const [giant, wurm] = attackers;
    const [elves, bears] = blockers;
    const declaredBefore = game.eventsOfType("blocker-declared").length;
    activate(game, path, 0, { targets: [ref(elves), ref(bears)] });
    expect(blocking(game, elves)).toBe(wurm);
    expect(blocking(game, bears)).toBe(giant);
    expect(blockedBy(game, giant)).toEqual([bears]);
    expect(blockedBy(game, wurm)).toEqual([elves]);
    // Each blocks again (509.3a, 509.3b), but neither attacker becomes
    // blocked a second time (509.3c).
    expect(game.eventsOfType("blocker-declared").length).toBe(declaredBefore + 2);
    expect(game.eventsOfType("attacker-blocked").length).toBe(2);
    // Its tapped trigger: 2 to Alice and each creature she controls.
    expect(life(game, A)).toBe(18);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("does nothing when one couldn't block what the other blocks (flying)", () => {
    const { game, attackers, blockers, path } = combat(["Serra Angel", "Hill Giant"], ["Giant Spider", "Grizzly Bears"], "Sorrow's Path");
    const [angel, giant] = attackers;
    const [spider, bears] = blockers;
    activate(game, path, 0, { targets: [ref(spider), ref(bears)] });
    expect(blocking(game, spider)).toBe(angel);
    expect(blocking(game, bears)).toBe(giant);
  });

  it("targets only blocking creatures one opponent controls", () => {
    const { game, blockers, path } = combat(["Hill Giant"], ["Llanowar Elves"], "Sorrow's Path");
    const idle = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, path, 0, { targets: [ref(blockers[0]), ref(idle)] })).toThrow(/target/i);
  });
});

describe("General Jarkeld", () => {
  it("swaps the blockers of two blocked attackers, nothing triggering", () => {
    const { game, attackers, blockers, path } = combat(["Hill Giant", "Craw Wurm"], ["Llanowar Elves", "Grizzly Bears"], "General Jarkeld");
    const [giant, wurm] = attackers;
    const [elves, bears] = blockers;
    const declaredBefore = game.eventsOfType("blocker-declared").length;
    activate(game, path, 0, { targets: [ref(giant), ref(wurm)] });
    expect(blocking(game, elves)).toBe(wurm);
    expect(blocking(game, bears)).toBe(giant);
    expect(blockedBy(game, giant)).toEqual([bears]);
    expect(blockedBy(game, wurm)).toEqual([elves]);
    expect(game.eventsOfType("blocker-declared").length).toBe(declaredBefore);
  });

  it("does nothing when one couldn't be blocked by the other's blockers (flying)", () => {
    const { game, attackers, blockers, path } = combat(["Serra Angel", "Hill Giant"], ["Giant Spider", "Grizzly Bears"], "General Jarkeld");
    const [angel, giant] = attackers;
    activate(game, path, 0, { targets: [ref(angel), ref(giant)] });
    expect(blockedBy(game, angel)).toEqual([blockers[0]]);
    expect(blockedBy(game, giant)).toEqual([blockers[1]]);
  });

  it("activates only during the declare blockers step", () => {
    const { game } = table();
    const jarkeld = spawn(game, "General Jarkeld", A);
    expect(() => activate(game, jarkeld, 0, { targets: [] })).toThrow();
  });
});
