import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { B, C, activate, enter, lands, life, nextTurn, pickModes, pickTargets, spawn, table, toStep, zone } from "./harness.js";

// A flicker's delayed return at a declare attackers step, tapped and
// attacking (rule 508.4) — Noctis, Heir Apparent's Warp-Strike: "Exile
// Noctis. Return it to the battlefield under its owner's control tapped and
// attacking at the beginning of that player's next declare attackers step. It
// can't be blocked that combat."

/** The one permanent named `name` on the battlefield. */
const named = (game: Game, name: string): ObjectId | undefined =>
  game.state.zones.shared.battlefield.find((id) => game.state.objects[id]?.cardName === name);

const blockersOffered = (game: Game, defender: PlayerId) =>
  game.legalActions(defender).find((o) => o.kind === "declare-blockers");

describe("Noctis, Heir Apparent — Warp-Strike", () => {
  it("returns tapped and attacking once attackers are declared, and can't be blocked that combat", () => {
    const { game, b } = table();
    const noctis = spawn(game, "Noctis, Heir Apparent");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    activate(game, noctis, 0);
    expect(zone(game, noctis)).toBe("exile");
    // Alice has nothing else to attack with: no declaration, and the return
    // comes all the same (the ruling).
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    const back = named(game, "Noctis, Heir Apparent")!;
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(game.state.objects[back].attacking).toBe(B);
    // Bob's untapped Bears could block anything else: nothing to ask him.
    let askedToBlock = 0;
    b.declareBlockersFn = () => {
      askedToBlock += 1;
      return [];
    };
    toStep(game, "postcombat-main");
    expect(askedToBlock).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("can be blocked in a later combat", () => {
    const { game, a } = table();
    const noctis = spawn(game, "Noctis, Heir Apparent");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    activate(game, noctis, 0);
    toStep(game, "postcombat-main");
    nextTurn(game);
    nextTurn(game);
    a.declareAttackersFn = () => [{ attacker: noctis, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = blockersOffered(game, B);
    const canBlock = offer?.kind === "declare-blockers" ? offer.eligible.find((e) => e.blocker === bears)?.canBlock : [];
    expect(canBlock).toContain(noctis);
  });

  it("waits for its owner's next declare attackers step, not an opponent's", () => {
    const { game } = table();
    const noctis = spawn(game, "Noctis, Heir Apparent");
    lands(game, "Plains", 3);
    toStep(game, "postcombat-main");
    activate(game, noctis, 0);
    expect(zone(game, noctis)).toBe("exile");
    // Bob's turn, his combat: still in exile.
    nextTurn(game, "end-combat");
    expect(game.state.turn.number).toBe(2);
    expect(named(game, "Noctis, Heir Apparent")).toBeUndefined();
    // Alice's next combat: back, attacking.
    nextTurn(game, "declare-blockers");
    const back = named(game, "Noctis, Heir Apparent");
    expect(game.state.turn.number).toBe(3);
    expect(back).toBeDefined();
    expect(game.state.objects[back!].attacking).toBe(B);
  });

  it("returns after its owner's declaration, beside what they attacked with, at the defender they choose", () => {
    const { game, a } = table({ players: 3 });
    const noctis = spawn(game, "Noctis, Heir Apparent");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    activate(game, noctis, 0);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    let asked = 0;
    a.chooseAttackTargetsFn = (_view, creatures) => {
      asked += 1;
      return creatures.map((c) => ({ object: c.object, target: C }));
    };
    toStep(game, "postcombat-main");
    const back = named(game, "Noctis, Heir Apparent")!;
    expect(asked).toBe(1);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(zone(game, back)).toBe("battlefield");
  });

  it("enters during combat, so it may pick up an Equipment as it returns", () => {
    const { game, a } = table();
    const noctis = spawn(game, "Noctis, Heir Apparent");
    const bonesplitter = spawn(game, "Bonesplitter");
    lands(game, "Plains", 3);
    // The same object id comes back (a new object by its stint, rule 400.7).
    pickTargets(a, bonesplitter, noctis);
    pickModes(a, 0);
    activate(game, noctis, 0);
    toStep(game, "postcombat-main");
    expect(zone(game, noctis)).toBe("battlefield");
    expect(game.state.objects[bonesplitter].attachedTo).toBe(noctis);
    expect(life(game, B)).toBe(16);
  });

  it("doesn't trigger the attach for a creature entering outside combat", () => {
    const { game, a } = table();
    spawn(game, "Noctis, Heir Apparent");
    const bonesplitter = spawn(game, "Bonesplitter");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    enter(game, "Grizzly Bears");
    expect(asked).toBe(0);
    expect(game.state.objects[bonesplitter].attachedTo ?? null).toBe(null);
  });
});
